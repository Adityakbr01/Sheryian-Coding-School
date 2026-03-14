import { HumanMessage, AIMessage } from "@langchain/core/messages";
import MistralAI from "@/configs/mistral.config";
import { AiRepository } from "@/modules/ai/ai.repository";
import { Socket } from "socket.io";
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
    static async getHistory(chatId: string, page: number = 1, limit?: number) {
        const records = await AiRepository.getHistoryByChat(chatId, page, limit);
        return records;
    }

    /**
     * Optional summarizer logic
     */
    static async generateTitle(prompt: string): Promise<string> {
        try {
            const summaryModel = MistralAI; // generic text generation
            const res = await summaryModel.invoke(`Create a very short title (max 5 words) for this chat prompt: "${prompt}"`);
            return res.content.toString().replace(/"/g, '').trim();
        } catch (error) {
            return "New Chat";
        }
    }

    /**
     * Process message via socket and stream response
     */
    static async handleSocketChat(userId: string, requestedChatId: string | null, prompt: string, socket: Socket) {
        let chat = await AiRepository.getOrCreateChat(userId, requestedChatId);
        
        // Auto title gen for first chat message
        const isFirstMessage = (await AiRepository.getHistoryByChat(chat.id, 1, 1)).length === 0;
        if (isFirstMessage) {
            const newTitle = await this.generateTitle(prompt);
            chat = await AiRepository.updateChatTitle(chat.id, newTitle);
            socket.emit("chat_title_updated", { chatId: chat.id, title: newTitle });
        }

        // 1. Save new message
        await AiRepository.saveMessage(chat.id, "user", prompt);
        
        // Memory RAG retrieval could be done here...
        // e.g., const queryEmbedding = await generateEmbedding(prompt);
        // const context = await AiRepository.searchMemories(userId, queryEmbedding);
        // prompt = \`Use context \${context} to answer \${prompt}\`;

        // 2. Fetch history
        const dbHistory = await AiRepository.getHistoryByChat(chat.id, 1, 50);

        const chatHistory: any[] = dbHistory.map((msg) => {
            if (msg.role === "assistant" || msg.role === "ai") {
                return new AIMessage(msg.content);
            }
            return new HumanMessage(msg.content);
        });

        // Add Langchain streaming support
        // Note: bindTools supports stream event
        const stream = await aiModel.stream(chatHistory);
        
        let aiContent = "";

        socket.emit("response_start", { chatId: chat.id });
        for await (const chunk of stream) {
            if (chunk.content) {
                socket.emit("response_chunk", { chatId: chat.id, content: chunk.content });
                aiContent += chunk.content;
            }
            // For simplicity in this demo, missing nested tool calls inside standard stream chunks.
        }

        socket.emit("response_end", { chatId: chat.id, totalContent: aiContent });

        // 5. Save AI's response
        if (aiContent) {
           await AiRepository.saveMessage(chat.id, "assistant", aiContent);
        }
    }

    /**
     * REST endpoint wrapper backwards compatibility
     */
    static async handleChat(userId: string, prompt: string): Promise<string> {
        const chat = await AiRepository.getOrCreateChat(userId);
        
        await AiRepository.saveMessage(chat.id, "user", prompt);

        const dbHistory = await AiRepository.getHistoryByChat(chat.id);
        const chatHistory: any[] = dbHistory.map((msg) => {
            if (msg.role === "assistant" || msg.role === "ai") {
                return new AIMessage(msg.content);
            }
            return new HumanMessage(msg.content);
        });

        let response = await aiModel.invoke(chatHistory);

        while (response.tool_calls && response.tool_calls.length > 0) {
            chatHistory.push(response);
            for (const toolCall of response.tool_calls) {
                const toolToExecute = availableTools.find(t => t.name === toolCall.name);
                if (toolToExecute) {
                    const toolMessage = await (toolToExecute as any).invoke(toolCall);
                    chatHistory.push(toolMessage);
                }
            }
            response = await aiModel.invoke(chatHistory);
        }

        const aiContent = response.content as string;
        await AiRepository.saveMessage(chat.id, "assistant", aiContent);
        return aiContent;
    }
}
