import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { env } from '../config/env'

//This file allready correct and working good
export class LangchainClient {
  private static chatInstance: ChatGoogleGenerativeAI

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
}
