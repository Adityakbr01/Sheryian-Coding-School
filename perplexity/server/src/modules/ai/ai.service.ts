import { HumanMessage, AIMessage } from "@langchain/core/messages";
import MistralAI from "@/configs/mistral.config";
import { AiRepository } from "@/modules/ai/ai.repository";

// Import all separated tools
import { 
    webSearchTool, 
    currentTimeTool, 
    currentDateTool 
} from "@/modules/ai/tools";

// Bind tools to the Mistral model
const availableTools = [webSearchTool, currentTimeTool, currentDateTool];
const aiModel = MistralAI.bindTools(availableTools);

export class AiService {
    /**
     * Retrieves user chat history from database
     */
    static async getHistory(userId: string) {
        const records = await AiRepository.getHistoryByUser(userId);
        return records;
    }

    /**
     * Processes a new chat message, saves to DB, fetches history,
     * invokes LangChain, and saves/returns the AI response.
     */
    static async handleChat(userId: string, prompt: string): Promise<string> {
        // 1. Save the new user message to DB
        await AiRepository.saveMessage(userId, "user", prompt);

        // 2. Fetch all historical messages for context
        const dbHistory = await AiRepository.getHistoryByUser(userId);

        // 3. Map Prisma DB records into LangChain Message objects
        const chatHistory: any[] = dbHistory.map((msg) => {
            if (msg.role === "assistant" || msg.role === "ai") {
                return new AIMessage(msg.content);
            }
            return new HumanMessage(msg.content);
        });

        // 4. Invoke LLM with the chronological conversation array + tools
        let response = await aiModel.invoke(chatHistory);

        // LangChain doesn't automatically run tools unless you use an AgentExecutor or LangGraph loop. 
        // We must manually execute tools if the model asks for them, and return the result to the model.
        while (response.tool_calls && response.tool_calls.length > 0) {
            console.log("\n[AI TOOL CALLS] Model requested tools:", JSON.stringify(response.tool_calls, null, 2));

            // Add the model's reasoning/tool-request to history
            chatHistory.push(response);

            // Execute the tools requested by the model
            for (const toolCall of response.tool_calls) {
                console.log(`[AI TOOL EXECUTION] Executing: ${toolCall.name} with args:`, toolCall.args);

                // Find the correct tool from our available tools array
                const toolToExecute = availableTools.find(t => t.name === toolCall.name);

                if (toolToExecute) {
                    const toolMessage = await (toolToExecute as any).invoke(toolCall);
                    console.log(`[AI TOOL RESULT] ${toolCall.name} returned data of length:`, String(toolMessage.content).length);
                    // Add the tool's output back to history
                    chatHistory.push(toolMessage);
                } else {
                    console.log(`[AI TOOL ERROR] Tool ${toolCall.name} not found!`);
                }
            }

            console.log("[AI TOOL LOOP] Re-invoking model with tool outputs...\n");
            // Call the model again so it can read the tool output and generate a final answer
            response = await aiModel.invoke(chatHistory);
        }

        const aiContent = response.content as string;

        // 5. Save the AI's response to the database
        await AiRepository.saveMessage(userId, "assistant", aiContent);

        return aiContent;
    }
}
