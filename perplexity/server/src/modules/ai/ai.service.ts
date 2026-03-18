import MistralAI from "@/configs/mistral.config";
import { aiRepository } from "@/modules/ai/ai.repository";
import logger from "@/utils/logger";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { Socket } from "socket.io";
import { memoryService } from "@/modules/ai/memory.service";
import {
  calculatorTool,
  currentDateTool,
  currentTimeTool,
  scraperTool,
  weatherTool,
  webSearchTool,
} from "@/modules/ai/tools";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 5;      // prevents infinite tool-call loops
const MAX_HISTORY_MESSAGES = 50;    // cap context window
const TITLE_MAX_WORDS = 5;
const MIN_PROMPT_LENGTH = 1;
const MAX_PROMPT_LENGTH = 10_000;

// ─── Tool Registry ────────────────────────────────────────────────────────────

const AVAILABLE_TOOLS = [
  webSearchTool,
  currentTimeTool,
  currentDateTool,
  calculatorTool,
  weatherTool,
  scraperTool,
];

const TOOL_MAP = new Map<string, any>(AVAILABLE_TOOLS.map((t) => [t.name, t]));

/** Bind tools once — not on every request */
const aiModel = MistralAI.bindTools(AVAILABLE_TOOLS);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolCallChunk {
  name: string;
  args: Record<string, unknown>;
  id?: string;
}

interface StreamContext {
  chatId: string;
  socket: Socket;
}

interface ChatResult {
  content: string;
  toolsUsed: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates and sanitises the incoming prompt.
 * Throws a typed error the caller can surface to the client.
 */
function validatePrompt(prompt: unknown): string {
  if (typeof prompt !== "string") {
    throw new TypeError("Prompt must be a string.");
  }
  const trimmed = prompt.trim();
  if (trimmed.length < MIN_PROMPT_LENGTH) {
    throw new RangeError("Prompt is empty.");
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new RangeError(`Prompt exceeds ${MAX_PROMPT_LENGTH} character limit.`);
  }
  return trimmed;
}

/**
 * Converts DB message records to LangChain message objects.
 * Skips malformed records instead of throwing.
 */
function buildChatHistory(
  dbHistory: Array<{ role: string; content: string }>,
): (HumanMessage | AIMessage)[] {
  const history: (HumanMessage | AIMessage)[] = [];
  for (const msg of dbHistory) {
    if (!msg.content) continue; // skip empty records
    if (msg.role === "assistant" || msg.role === "ai") {
      history.push(new AIMessage(msg.content));
    } else if (msg.role === "user") {
      history.push(new HumanMessage(msg.content));
    } else {
      logger.warn(`Unknown message role skipped: "${msg.role}"`);
    }
  }
  return history;
}

/**
 * Builds the final RAG-augmented prompt injected into the conversation.
 */
function buildFinalPrompt(prompt: string, context: string): string {
  const memoryBlock = context.trim()
    ? `Relevant context from user's memory:\n${context}`
    : "No previous memories found.";

  return `You are a helpful AI assistant with access to tools.

${memoryBlock}

User question:
${prompt}`;
}

/**
 * Executes a single tool call and returns a LangChain ToolMessage.
 * Returns null on failure so the loop can skip gracefully.
 */
async function executeToolCall(
  toolCall: ToolCallChunk,
  ctx: StreamContext,
): Promise<ToolMessage | null> {
  const tool = TOOL_MAP.get(toolCall.name);
  if (!tool) {
    logger.warn(`Tool not found: "${toolCall.name}"`);
    return null;
  }

  ctx.socket.emit("tool_execution_start", {
    chatId: ctx.chatId,
    toolName: toolCall.name,
  });

  try {
    const result = await (tool as any).invoke(toolCall);
    ctx.socket.emit("tool_execution_end", {
      chatId: ctx.chatId,
      toolName: toolCall.name,
    });
    return result;
  } catch (err: any) {
    logger.error(`Tool "${toolCall.name}" failed: ${err.message}`);
    ctx.socket.emit("tool_execution_error", {
      chatId: ctx.chatId,
      toolName: toolCall.name,
      error: err.message,
    });

    // Return a graceful error message as tool output so the LLM can recover
    return new ToolMessage({
      tool_call_id: toolCall.id ?? toolCall.name,
      content: `Tool "${toolCall.name}" encountered an error: ${err.message}. Please try a different approach.`,
    });
  }
}

/**
 * Streams one LLM turn, accumulates content + tool calls.
 * Emits chunks over the socket in real-time.
 */
async function streamOneTurn(
  chatHistory: (HumanMessage | AIMessage | ToolMessage)[],
  ctx: StreamContext,
): Promise<{ content: string; toolCalls: ToolCallChunk[] }> {
  let content = "";
  const toolCalls: ToolCallChunk[] = [];

  try {
    const stream = await aiModel.stream(chatHistory);

    for await (const chunk of stream) {
      // Accumulate text content
      if (chunk.content) {
        const text = chunk.content.toString();
        content += text;
        ctx.socket.emit("response_chunk", { chatId: ctx.chatId, content: text });
        process.stdout.write(text);
      }

      // Accumulate tool calls (may arrive across multiple chunks)
      if (Array.isArray(chunk.tool_calls) && chunk.tool_calls.length > 0) {
        toolCalls.push(...chunk.tool_calls);
      }
    }

    process.stdout.write("\n");
  } catch (err: any) {
    logger.error(`Stream error during LLM turn: ${err.message}`);

    // Emit a partial-error event so the client knows the stream broke mid-flight
    ctx.socket.emit("response_error", {
      chatId: ctx.chatId,
      error: "The AI response was interrupted. Please try again.",
    });
    throw err; // re-throw so the outer handler can clean up
  }

  return { content, toolCalls };
}

// ─── Core Agentic Loop ────────────────────────────────────────────────────────

/**
 * Runs the full agentic loop:
 *   stream → execute tools → re-stream → repeat until no more tool calls
 *   or MAX_TOOL_ITERATIONS is reached.
 */
async function runAgenticLoop(
  chatHistory: (HumanMessage | AIMessage | ToolMessage)[],
  ctx: StreamContext,
): Promise<ChatResult> {
  let totalContent = "";
  const toolsUsed: string[] = [];
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const { content, toolCalls } = await streamOneTurn(chatHistory, ctx);
    totalContent += content;

    // No more tool calls — we're done
    if (toolCalls.length === 0) break;

    // Guard: deduplicate tool calls by id to avoid double-execution
    const uniqueToolCalls = toolCalls.filter(
      (tc, i, arr) => !tc.id || arr.findIndex((x) => x.id === tc.id) === i,
    );

    logger.info(
      `Iteration ${iterations}: executing ${uniqueToolCalls.length} tool(s): ` +
        uniqueToolCalls.map((t) => t.name).join(", "),
    );

    // Add the assistant's tool-calling turn to history
    chatHistory.push(new AIMessage({ content: "", tool_calls: uniqueToolCalls }));

    // Execute all tool calls in parallel for speed
    const toolResults = await Promise.all(
      uniqueToolCalls.map((tc) => executeToolCall(tc, ctx)),
    );

    // Add successful tool results to history; skip nulls (unknown tools)
    for (const result of toolResults) {
      if (result) {
        chatHistory.push(result);
        const toolName = uniqueToolCalls.find(
          (tc) => tc.id === (result as any).tool_call_id,
        )?.name;
        if (toolName) toolsUsed.push(toolName);
      }
    }
  }

  if (iterations >= MAX_TOOL_ITERATIONS) {
    logger.warn(`Max tool iterations (${MAX_TOOL_ITERATIONS}) reached for chat ${ctx.chatId}.`);
    ctx.socket.emit("response_warning", {
      chatId: ctx.chatId,
      warning: "Maximum tool execution steps reached.",
    });
  }

  return { content: totalContent, toolsUsed };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiService = {
  /**
   * Retrieves paginated chat history.
   */
  getHistory: async (chatId: string, page = 1, limit?: number) => {
    return aiRepository.getHistoryByChat(chatId, page, limit);
  },

  /**
   * Generates a short title for a new chat.
   * Falls back to "New Chat" on any failure.
   */
  generateTitle: async (prompt: string): Promise<string> => {
    try {
      const res = await MistralAI.invoke(
        `Generate a very short title (max ${TITLE_MAX_WORDS} words, no quotes) for this user message: "${prompt.slice(0, 200)}"`,
      );
      const title = res.content.toString().replace(/"/g, "").trim();
      return title || "New Chat";
    } catch {
      return "New Chat";
    }
  },

  /**
   * Primary socket handler — streams AI response with full tool support.
   *
   * Edge cases handled:
   *  - Invalid / oversized prompts → immediate error event, no DB write
   *  - First message → async title generation without blocking response
   *  - Memory retrieval failure → graceful fallback, chat still proceeds
   *  - Tool not found → logged + skipped, loop continues
   *  - Tool throws → error surfaced as ToolMessage so LLM can recover
   *  - Infinite tool loops → hard cap at MAX_TOOL_ITERATIONS
   *  - Duplicate tool calls in one turn → deduplicated by id
   *  - Empty AI response → not saved to DB, warning emitted
   *  - Stream interruption → error event + re-throw for socket error handler
   *  - Memory save failure → fire-and-forget, never blocks response
   */
  handleSocketChat: async (
    userId: string,
    requestedChatId: string | null,
    rawPrompt: string,
    socket: Socket,
  ): Promise<void> => {
    // ── Validate ──────────────────────────────────────────────────────────────
    let prompt: string;
    try {
      prompt = validatePrompt(rawPrompt);
    } catch (err: any) {
      socket.emit("response_error", { error: err.message });
      return;
    }

    // ── Chat record ───────────────────────────────────────────────────────────
    let chat = await aiRepository.getOrCreateChat(userId, requestedChatId);
    const ctx: StreamContext = { chatId: chat.id, socket };

    // ── Auto-title (async, non-blocking) ──────────────────────────────────────
    const isFirstMessage =
      (await aiRepository.getHistoryByChat(chat.id, 1, 1)).length === 0;

    if (isFirstMessage) {
      aiService
        .generateTitle(prompt)
        .then(async (title) => {
          chat = await aiRepository.updateChatTitle(chat.id, title);
          socket.emit("chat_title_updated", { chatId: chat.id, title });
        })
        .catch((err) => logger.warn(`Title generation failed: ${err.message}`));
    }

    // ── Persist user message ──────────────────────────────────────────────────
    await aiRepository.saveMessage(chat.id, "user", prompt);

    // ── Memory context (non-blocking on failure) ──────────────────────────────
    let memoryResult = { context: "", closestDistance: null as number | null };
    try {
      memoryResult = await memoryService.getContextForPrompt(userId, prompt);
    } catch (err) {
      logger.warn(`Memory retrieval failed, proceeding without context: ${err}`);
    }

    // ── Build history ─────────────────────────────────────────────────────────
    const dbHistory = await aiRepository.getHistoryByChat(chat.id, 1, MAX_HISTORY_MESSAGES);
    const chatHistory: (HumanMessage | AIMessage | ToolMessage)[] =
      buildChatHistory(dbHistory);

    // Replace the last HumanMessage (just saved) with the RAG-augmented version
    if (
      chatHistory.length > 0 &&
      chatHistory[chatHistory.length - 1] instanceof HumanMessage
    ) {
      chatHistory.pop();
    }
    chatHistory.push(new HumanMessage(buildFinalPrompt(prompt, memoryResult.context)));

    // ── Stream + agentic loop ─────────────────────────────────────────────────
    socket.emit("response_start", { chatId: chat.id });

    let result: ChatResult;
    try {
      result = await runAgenticLoop(chatHistory, ctx);
    } catch (err: any) {
      logger.error(`Agentic loop failed for chat ${chat.id}: ${err.message}`);
      // response_error was already emitted inside streamOneTurn
      return;
    }

    // ── Finalise ──────────────────────────────────────────────────────────────
    const { content: aiContent, toolsUsed } = result;

    socket.emit("response_end", {
      chatId: chat.id,
      totalContent: aiContent,
      toolsUsed,
    });

    if (aiContent.trim()) {
      await aiRepository.saveMessage(chat.id, "assistant", aiContent);
    } else {
      logger.warn(`Empty AI response for chat ${chat.id} — not saved.`);
      socket.emit("response_warning", {
        chatId: chat.id,
        warning: "AI returned an empty response.",
      });
    }

    // ── Background memory evaluation ──────────────────────────────────────────
    memoryService
      .evaluateAndSaveMemory(userId, prompt, memoryResult.closestDistance)
      .catch((err) => logger.error(`Background memory save failed: ${err}`));
  },

  /**
   * REST endpoint — non-streaming, agentic tool loop, full error handling.
   *
   * Edge cases handled:
   *  - Invalid prompt → throws immediately
   *  - Tool not found → logged + skipped
   *  - Tool throws → logged + skipped, LLM re-prompted without result
   *  - Infinite loops → capped at MAX_TOOL_ITERATIONS
   *  - Empty response → returns empty string (caller can decide)
   */
  handleChat: async (userId: string, rawPrompt: string): Promise<string> => {
    const prompt = validatePrompt(rawPrompt);

    const chat = await aiRepository.getOrCreateChat(userId);
    await aiRepository.saveMessage(chat.id, "user", prompt);

    const dbHistory = await aiRepository.getHistoryByChat(chat.id);
    const chatHistory: (HumanMessage | AIMessage | ToolMessage)[] =
      buildChatHistory(dbHistory);

    let response = await aiModel.invoke(chatHistory);
    let iterations = 0;

    while (
      response.tool_calls &&
      response.tool_calls.length > 0 &&
      iterations < MAX_TOOL_ITERATIONS
    ) {
      iterations++;
      logger.info(
        `REST tool iteration ${iterations}: ${response.tool_calls.map((t: any) => t.name).join(", ")}`,
      );

      chatHistory.push(response);

      const toolResults = await Promise.all(
        response.tool_calls.map(async (toolCall: ToolCallChunk) => {
          const tool = TOOL_MAP.get(toolCall.name);
          if (!tool) {
            logger.warn(`REST: tool not found — "${toolCall.name}"`);
            return null;
          }
          try {
            return await (tool as any).invoke(toolCall);
          } catch (err: any) {
            logger.error(`REST: tool "${toolCall.name}" failed: ${err.message}`);
            return new ToolMessage({
              tool_call_id: toolCall.id ?? toolCall.name,
              content: `Tool "${toolCall.name}" failed: ${err.message}`,
            });
          }
        }),
      );

      for (const result of toolResults) {
        if (result) chatHistory.push(result);
      }

      response = await aiModel.invoke(chatHistory);
    }

    if (iterations >= MAX_TOOL_ITERATIONS) {
      logger.warn(`REST: max tool iterations reached for chat ${chat.id}.`);
    }

    const aiContent = (response.content as string) ?? "";

    if (aiContent.trim()) {
      await aiRepository.saveMessage(chat.id, "assistant", aiContent);
    } else {
      logger.warn(`REST: empty response for chat ${chat.id}.`);
    }

    return aiContent;
  },
};