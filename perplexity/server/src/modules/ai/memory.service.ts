import prisma from "@/configs/db";
import embeddings from "@/configs/embedding.config";
import logger from "@/utils/logger";
import MistralAI from "@/configs/mistral.config";

// ─── TTL Cache ────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private ttlMs: number) {}

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

const embeddingCache = new TTLCache<number[]>(10 * 60 * 1000); // 10 min
const factualityCache = new TTLCache<string>(5 * 60 * 1000);   // 5 min

// ─── Constants ────────────────────────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.15;
const RELEVANCE_THRESHOLD = 1.0;

// ─── Regex Patterns ───────────────────────────────────────────────────────────

/**
 * PERSONAL REFERENCE REGEX
 *
 * Detects when the user is talking about THEMSELVES.
 * Used as the highest-priority override — if matched, always retrieve context.
 *
 * ⚠️  CRITICAL BUG FIXED: The old /\bme\b/ matched substrings like:
 *     "te[me]rature", "na[me]", "ti[me]", "ga[me]"
 *     This caused weather/tool queries to incorrectly trigger memory retrieval.
 *
 *     Fix: match only explicit first-person pronouns and possessives as
 *     full standalone tokens using (?:^|\s) and (?:\s|$|[?!,.]) anchors.
 *     "me" is intentionally excluded — too ambiguous ("give me", "tell me").
 *
 * Correctly catches:
 *   "what is my name"         ✅
 *   "I am a developer"        ✅
 *   "I've been learning React" ✅
 *   "I live in Bihar"         ✅
 *   "my favourite colour"     ✅
 *   "about myself"            ✅
 *
 * Correctly does NOT catch:
 *   "what is the weather"     ✅ — no personal pronoun
 *   "temperature in Bihar"    ✅ — "me" in "temperature" is a substring, not a word
 *   "give me a recipe"        ✅ — imperative, not a self-referential fact
 *   "tell me about Tesla"     ✅ — "me" as indirect object, not self-reference
 */
const PERSONAL_REFERENCE_REGEX =
  /(?:^|\s)(my|mine|i am|i'm|i've|i have|i like|i love|i hate|i work|i live|i study|i go|i play|i use|i prefer|i enjoy|i own|i run|i build|i know|myself|about myself|remember me)(?=\s|$|[?!,.])/i;

/**
 * TOOL / COMPUTATION REGEX
 *
 * Queries requiring real-time tool calls — memory context is irrelevant.
 *
 * Catches:
 *   "weather in Mumbai"            ✅
 *   "what's the weather today"     ✅
 *   "what time is it"              ✅
 *   "calculate 200 * 18"           ✅
 *   "translate hello to Spanish"   ✅
 *   "convert 5km to miles"         ✅
 *   "define recursion"             ✅
 *   "what is 30% of 500"           ✅
 */
const TOOL_ONLY_REGEX =
  /^(weather\b|what(?:'s| is) (the )?weather|check (the )?weather|forecast\b|temperature (in|for|of)\b|what (time|day|date|year) is it|what'?s the (time|date|day)\b|current (time|date|weather|temperature)\b|calculate\b|compute\b|solve\b|translate\b|convert\b|define\b|what(?:'s| is) \d|how (many|much|long|far|old|tall|big|heavy|fast)\b|percentage\b|factorial\b|sqrt\b)/i;

/**
 * WORLD KNOWLEDGE REGEX
 *
 * Encyclopedic / factual questions about the external world.
 * No personal memory needed to answer these.
 *
 * Catches:
 *   "what is the capital of France"     ✅
 *   "who is Elon Musk"                  ✅
 *   "when did WW2 end"                  ✅
 *   "how does photosynthesis work"      ✅
 *   "why is the sky blue"               ✅
 *   "explain quantum computing"         ✅
 *   "is Python faster than JavaScript"  ✅
 */
const WORLD_KNOWLEDGE_REGEX =
  /^(what is (the|a|an) |what are (the|some) |who is |who was |who are |when did |when was |when were |where is |where was |where are |why is |why does |why do |why was |how does |how do |how is |how was |is (the|a|an) |are (the|some) |explain |describe |tell me (about|what|how|why|when|where|who) |what(?:'s| is) (the difference|the meaning|the purpose|the role|the function|the history|the origin)|can you (explain|describe|tell)|what happens (when|if|to) |does (the|a|an) )/i;

/**
 * GREETING REGEX
 *
 * Pure social openers — no information to retrieve or store.
 *
 * Catches:
 *   "hi", "hello", "hey!", "good morning", "what's up", "how are you"  ✅
 */
const GREETING_REGEX =
  /^(hi\b|hello\b|hey\b|yo\b|sup\b|hiya\b|howdy\b|greetings\b|good (morning|afternoon|evening|night)\b|what'?s up\b|how are you\b|how'?s it going\b|how have you been\b)/i;

/**
 * COMMAND REGEX
 *
 * Task-execution requests with no personal angle.
 *
 * Catches:
 *   "write a poem", "summarize this", "list 5 books"  ✅
 *   "generate a password", "debug this code"           ✅
 *
 * Does NOT catch (correctly — personal override fires first):
 *   "write a poem for my anniversary"  ✅ — "my" triggers personal override
 */
const COMMAND_REGEX =
  /^(write (a|an|me|some)\b|summarize\b|list\b|give me (a|an|some|examples?|a list)\b|show me (a|an|how)\b|find (a|an|some|synonyms?|antonyms?)\b|generate\b|create (a|an|me)\b|make (a|an|me)\b|draft\b|compose\b|format\b|rewrite\b|edit\b|proofread\b|fix\b|debug\b|code\b|build\b)/i;

/**
 * EXTERNAL TOPIC REGEX
 *
 * Lookups about external entities — companies, people, topics.
 * Personal memory irrelevant.
 *
 * Catches:
 *   "tell me about Tesla"                   ✅
 *   "search for React tutorials"            ✅
 *   "what do people think about ChatGPT"   ✅
 */
const EXTERNAL_TOPIC_REGEX =
  /^(tell me about\b|search (for|the)\b|look up\b|find (info|information|details) (on|about)\b|research\b|what do people (think|say) about\b)/i;

// ─── Heuristic Engine ─────────────────────────────────────────────────────────

interface HeuristicResult {
  skip: boolean;
  reason?: string;
}

/**
 * Decides whether to SKIP context retrieval (embedding + DB search).
 *
 * Priority order (MUST be evaluated in this exact order):
 *  1. Personal reference → NEVER skip — user is asking about themselves
 *  2. Tool/real-time     → skip — live data, memory useless
 *  3. Greeting           → skip
 *  4. World knowledge    → skip
 *  5. Command            → skip
 *  6. External topic     → skip
 *  7. Too short          → skip
 *  8. Default            → retrieve
 */
function shouldSkipContextRetrieval(prompt: string): HeuristicResult {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  // Rule 1 — Personal reference (must be first — highest priority override)
  if (PERSONAL_REFERENCE_REGEX.test(lower)) {
    return { skip: false };
  }

  // Rule 2 — Tool / real-time data (must be before world-knowledge)
  if (TOOL_ONLY_REGEX.test(lower)) {
    return { skip: true, reason: "tool/real-time query" };
  }

  // Rule 3 — Greeting
  if (GREETING_REGEX.test(lower)) {
    return { skip: true, reason: "greeting/social opener" };
  }

  // Rule 4 — World knowledge question
  if (WORLD_KNOWLEDGE_REGEX.test(lower)) {
    return { skip: true, reason: "world-knowledge question" };
  }

  // Rule 5 — Command-style prompt
  if (COMMAND_REGEX.test(lower)) {
    return { skip: true, reason: "command-style prompt" };
  }

  // Rule 6 — External topic lookup
  if (EXTERNAL_TOPIC_REGEX.test(lower)) {
    return { skip: true, reason: "external topic lookup" };
  }

  // Rule 7 — Too short
  if (trimmed.split(/\s+/).length <= 2) {
    return { skip: true, reason: "too short to need context" };
  }

  // Rule 8 — Default: retrieve
  return { skip: false };
}

/**
 * Decides whether to SKIP memory extraction (LLM save step).
 *
 * Stricter than retrieval — we only save declarative user FACTS.
 * "What is my favourite colour?" → should RETRIEVE but NOT save.
 *
 *  1. Ends with "?" → it's a question → skip
 *  2. Tool query    → skip
 *  3. Greeting      → skip
 *  4. World knowledge → skip
 *  5. Command       → skip
 *  6. External topic → skip
 *  7. Too short     → skip
 *  8. Default       → proceed to LLM
 */
function shouldSkipMemoryExtraction(prompt: string): HeuristicResult {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  // Questions are never declarative facts
  if (lower.endsWith("?")) {
    return { skip: true, reason: "prompt is a question" };
  }

  if (TOOL_ONLY_REGEX.test(lower)) {
    return { skip: true, reason: "tool/real-time query" };
  }

  if (GREETING_REGEX.test(lower)) {
    return { skip: true, reason: "greeting" };
  }

  if (WORLD_KNOWLEDGE_REGEX.test(lower)) {
    return { skip: true, reason: "world-knowledge question" };
  }

  if (COMMAND_REGEX.test(lower)) {
    return { skip: true, reason: "command-style prompt" };
  }

  if (EXTERNAL_TOPIC_REGEX.test(lower)) {
    return { skip: true, reason: "external topic lookup" };
  }

  if (trimmed.split(/\s+/).length <= 2) {
    return { skip: true, reason: "too short" };
  }

  return { skip: false };
}

// ─── Embedding Helper ─────────────────────────────────────────────────────────

async function getEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.slice(0, 200);
  const cached = embeddingCache.get(cacheKey);
  if (cached) {
    logger.info("🟢 Embedding cache HIT — skipping API call.");
    return cached;
  }
  logger.warn("💸 EMBEDDING API CALL: Generating new vector via Mistral...");
  const vector = await embeddings.embedQuery(text);
  embeddingCache.set(cacheKey, vector);
  return vector;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const memoryService = {
  /**
   * Saves a factual memory string with its embedding vector.
   */
  saveMemory: async (userId: string, content: string): Promise<void> => {
    try {
      const vector = await getEmbedding(content);
      const vectorString = `[${vector.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "Memory" ("userId", "content", "embedding")
        VALUES (${userId}, ${content}, ${vectorString}::vector)
        ON CONFLICT DO NOTHING
      `;
      logger.info(`✅ Memory saved for user: ${userId} → "${content}"`);
    } catch (error: any) {
      logger.error(`Failed to save memory for user ${userId}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Retrieves semantically relevant memory context for a given prompt.
   *
   * Gates (cheapest → most expensive):
   *  1. Heuristic skip   — no embedding if memory clearly won't help
   *  2. Embedding + search — only when context could genuinely help
   *  3. Relevance filter  — drop results above RELEVANCE_THRESHOLD
   */
  getContextForPrompt: async (
    userId: string,
    prompt: string,
    limit = 5,
  ): Promise<{ context: string; closestDistance: number | null }> => {
    try {
      const { skip, reason } = shouldSkipContextRetrieval(prompt);

      if (skip) {
        logger.info(`⏭️  Context retrieval SKIPPED — ${reason}. No embedding call.`);
        return { context: "", closestDistance: null };
      }

      logger.info("🔍 FLOW: Retrieving memory context...");
      const queryEmbedding = await getEmbedding(prompt);
      const vectorString = `[${queryEmbedding.join(",")}]`;

      const memories = (await prisma.$queryRaw`
        SELECT "content", ("embedding" <-> ${vectorString}::vector) AS distance
        FROM "Memory"
        WHERE "userId" = ${userId}
          AND ("embedding" <-> ${vectorString}::vector) < ${RELEVANCE_THRESHOLD}
        ORDER BY distance
        LIMIT ${limit};
      `) as { content: string; distance: number }[];

      logger.info(`Found ${memories.length} relevant memories.`);

      if (memories.length === 0) return { context: "", closestDistance: null };

      logger.debug(`Closest memory distance: ${memories[0].distance}`);
      return {
        context: memories.map((m) => m.content).join("\n"),
        closestDistance: memories[0].distance,
      };
    } catch (error) {
      logger.error(`Failed to retrieve memory context: ${error}`);
      return { context: "", closestDistance: null };
    }
  },

  /**
   * Evaluates a user prompt and saves a factual memory if appropriate.
   *
   * Gates (cheapest → most expensive):
   *  1. Length guard       — skip trivially short/long prompts
   *  2. Similarity guard   — skip if near-duplicate already exists
   *  3. Heuristic skip     — skip questions/commands/greetings
   *  4. Factuality cache   — skip if same prompt evaluated recently
   *  5. LLM extraction     — only when all cheaper gates pass
   */
  evaluateAndSaveMemory: async (
    userId: string,
    prompt: string,
    closestDistance: number | null = null,
  ): Promise<void> => {
    logger.info("🧠 FLOW: Starting background memory evaluation...");

    // Gate 1: length guard
    if (prompt.length < 5 || prompt.length > 1000) {
      logger.info("⏭️  Memory extraction SKIPPED — length out of bounds.");
      return;
    }

    // Gate 2: similarity guard
    if (closestDistance !== null && closestDistance < SIMILARITY_THRESHOLD) {
      logger.info(`⏭️  Memory extraction SKIPPED — near-duplicate exists (distance: ${closestDistance}).`);
      return;
    }

    // Gate 3: heuristic
    const { skip, reason } = shouldSkipMemoryExtraction(prompt);
    if (skip) {
      logger.info(`⏭️  Memory extraction SKIPPED — ${reason}. No LLM call.`);
      return;
    }

    // Gate 4: factuality cache
    const cacheKey = prompt.slice(0, 200);
    const cachedResult = factualityCache.get(cacheKey);
    if (cachedResult !== null) {
      if (cachedResult !== "IGNORE") {
        logger.info("🟢 Factuality cache HIT — saving cached extraction. No LLM call.");
        await memoryService.saveMemory(userId, cachedResult);
      } else {
        logger.info("🟢 Factuality cache HIT — previously IGNORE. No LLM call.");
      }
      return;
    }

    // Gate 5: LLM extraction
    try {
      const extractorPrompt = `You are a memory-extraction assistant.

User message: "${prompt}"

Task: If the user is sharing a personal fact, preference, or detail about themselves useful to remember for future conversations (e.g. their name, job, location, hobby, favourite things, relationships, goals), extract it as a single concise factual sentence.

Examples of good extractions:
- "User's name is Aditya"
- "User works as a software engineer"
- "User lives in Bihar, India"
- "User's favourite colour is red"
- "User has a dog named Max"
- "User is learning machine learning"
- "User prefers dark mode"
- "User's goal is to lose 10kg"

If the message is a question, greeting, command, or does not contain a personal user fact, reply with exactly: IGNORE

Rules:
- Output ONLY the extracted fact OR the word IGNORE
- No explanation, no preamble, no extra punctuation
- Write the fact in third person ("User's X is Y" or "User X")`;

      logger.warn("💸 LLM API CALL: Evaluating memory extraction via Mistral...");
      const result = await MistralAI.invoke([{ role: "user", content: extractorPrompt }]);
      const extraction = result.content.toString().trim();

      factualityCache.set(cacheKey, extraction);

      if (extraction && extraction !== "IGNORE") {
        logger.info(`✨ New memory extracted: "${extraction}"`);
        await memoryService.saveMemory(userId, extraction);
      } else {
        logger.info("⏭️  LLM evaluated prompt as non-factual. Nothing saved.");
      }
    } catch (error) {
      logger.error(`Error during memory evaluation: ${error}`);
    }
  },

  /**
   * Convenience method: retrieval + background evaluation in one call.
   * Evaluation is fire-and-forget — never blocks the response.
   */
  processPrompt: async (
    userId: string,
    prompt: string,
    limit = 5,
  ): Promise<{ context: string }> => {
    const { context, closestDistance } = await memoryService.getContextForPrompt(
      userId,
      prompt,
      limit,
    );

    memoryService
      .evaluateAndSaveMemory(userId, prompt, closestDistance)
      .catch((err) => logger.error(`Background memory save failed: ${err}`));

    return { context };
  },
};