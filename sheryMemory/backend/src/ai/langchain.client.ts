import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { NomicEmbeddings } from '@langchain/nomic'
import { env } from '../config/env'


//This file allready correct and working good
export class LangchainClient {
    private static chatInstance: ChatGoogleGenerativeAI
    private static embeddingInstance: NomicEmbeddings

    static getChatInstance(): ChatGoogleGenerativeAI {
        if (!this.chatInstance) {
            if (!env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is missing from environment')
            }
            this.chatInstance = new ChatGoogleGenerativeAI({
                apiKey: env.GEMINI_API_KEY,
                model: env.GEMINI_MODEL,
                maxOutputTokens: 2048,
                temperature: 0,
            })
        }
        return this.chatInstance
    }

    static getEmbeddingInstance(): NomicEmbeddings {
        if (!this.embeddingInstance) {
            const apiKey = env.HUGGINGFACE_API_KEY
            if (!apiKey) {
                throw new Error('HUGGINGFACE_API_KEY is missing from environment (used for Nomic embeddings)')
            }
            this.embeddingInstance = new NomicEmbeddings({
                apiKey,
                model: 'nomic-embed-text-v1.5',
            })
        }
        return this.embeddingInstance
    }
}
