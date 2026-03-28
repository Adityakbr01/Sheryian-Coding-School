import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { ChatMessage } from '@prisma/client'

/**
 * Builds a system prompt enforcing the Second Brain AI persona and strictly dictating structure by mode.
 */
export const buildContextPrompt = (contextItems: any[], mode: 'search' | 'explore' | 'recall' = 'search') => {
  const formattedItems = contextItems
    .map((item, i) => `[${i + 1}] ${item.title || item.url}\nType: ${item.type || 'unknown'}\nSummary: ${(item.summary || '').slice(0, 200)}`)
    .join('\n\n')

  let modeInstruction = ''
  if (mode === 'search') {
    modeInstruction = `
MODE: SEARCH (Direct Knowledge Retrieval)
- Provide a strict, factual answer using ONLY the context.
- Keep it concise.
- Set your output exactly like this:
  Answer:
  * [Direct answer]
  Sources:
  * [Mention sources]
`
  } else if (mode === 'explore') {
    modeInstruction = `
MODE: EXPLORE (Connecting Ideas)
- Analyze the context and suggest related concepts.
- Connect the dots between different saved items.
- Set your output exactly like this:
  Exploration:
  * [Brief insights from context]
  Connections:
  * [How items relate to each other or the broader topic]
  Next Steps:
  * [What user should learn/explore next]
`
  } else if (mode === 'recall') {
    modeInstruction = `
MODE: RECALL (Memory Resurfacing)
- Focus entirely on reminding the user what they have saved about this topic.
- Do NOT teach the topic. Only summarize what the user already has.
- Set your output exactly like this:
  From your memory:
  * [Summarize what they saved]
  Key items you saved:
  * [List titles and types]
`
  }

  return `You are an intelligent Personal Knowledge Assistant.
You help users interact with their saved knowledge (articles, videos, notes, PDFs, etc).
Your job is NOT to act like a generic chatbot. Your job is to act strictly according to the requested MODE.

CORE BEHAVIOR:
1. ALWAYS prioritize user's saved data (CONTEXT).
2. If answer/topic is NOT found in context -> say: "I couldn't find this in your saved knowledge, but here's a general answer"
3. Do NOT hallucinate or make up saved content.

CONTEXT (user's saved knowledge):
${formattedItems}

${modeInstruction}

Before answering: Think step-by-step silently about which context is relevant and follow the MODE structure exactly.`
}

/**
 * Wraps the current user query to enforce instructions.
 */
export const wrapUserPrompt = (content: string) => {
  return `USER QUERY:\n${content}\n\nINSTRUCTION:\n- Understand intent deeply\n- Answer using saved knowledge first\n- Avoid generic explanation`
}

/**
 * Formats DB chat history into LangChain message objects.
 */
export const formatChatHistory = (
  history: { role: string; content: string }[],
  systemPrompt: string
) => {
  const messages: any[] = [new SystemMessage(systemPrompt)]
  
  for (const msg of history) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content))
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content))
    }
  }
  
  return messages
}
