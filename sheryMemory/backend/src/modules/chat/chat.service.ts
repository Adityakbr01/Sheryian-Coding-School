import { LangchainClient } from '../../config/langchain.client'
import { ItemsService } from '../items/items.service'
import { AppError } from '../../utils/AppError'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { buildContextPrompt, formatChatHistory, wrapUserPrompt } from './chat.utils'
import { ChatDao } from './chat.dao'

export const ChatService = {
  async getSessions(userId: string) {
    return ChatDao.getSessions(userId)
  },

  async createSession(userId: string, title: string = 'New Chat') {
    return ChatDao.createSession(userId, title)
  },

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await ChatDao.findSession(sessionId, userId)
    if (!session) throw new AppError('Session not found', 404)

    return ChatDao.getMessages(sessionId)
  },

  async sendMessage(userId: string, sessionId: string, content: string, mode: 'search' | 'explore' | 'recall' = 'search') {
    const session = await ChatDao.findSession(sessionId, userId)
    if (!session) throw new AppError('Session not found', 404)

    const [contextItems, rawHistory] = await Promise.all([
      ItemsService.searchItems(userId, content, 3),
      ChatDao.findRecentMessages(sessionId, 5)
    ])

    const isFirstMessage = rawHistory.length === 0
    const history = [...rawHistory].reverse()

    // Save user message (background)
    ChatDao.saveMessage({ chatSessionId: sessionId, role: 'user', content }).catch(e => console.error('Failed to save user message:', e))

    const systemPrompt = buildContextPrompt(contextItems, mode)
    const messages = formatChatHistory(history as any, systemPrompt)
    messages.push(new HumanMessage(wrapUserPrompt(content)))

    const llm = LangchainClient.getChatInstance()
    const llmResponse = await llm.invoke(messages)
    const replyContent = llmResponse.content.toString()

    const aiMessage = await ChatDao.saveMessage({
      chatSessionId: sessionId,
      role: 'assistant',
      content: replyContent,
      context: contextItems,
    })

    if (isFirstMessage) {
      let newTitle = content.length > 30 ? content.substring(0, 30) + '...' : content
      try {
        const titleResponse = await llm.invoke([
          new SystemMessage("You are a helpful assistant. Generate a very short (2-5 words) highly descriptive title for this conversation based on the user's first message. Respond ONLY with the title. Do not use quotes or punctuation."),
          new HumanMessage(content)
        ])
        if (titleResponse.content) {
          newTitle = titleResponse.content.toString().replace(/["']/g, '').trim()
        }
      } catch (err) {
        console.error('Failed to auto-generate title:', err)
      }
      await ChatDao.updateSessionTitle(sessionId, newTitle)
    } else {
      await ChatDao.updateSessionTimestamp(sessionId)
    }

    return aiMessage
  },

  async deleteSession(userId: string, sessionId: string) {
    const deleted = await ChatDao.deleteSession(sessionId, userId)
    if (deleted.count === 0) throw new AppError('Session not found', 404)
    return { success: true }
  },

  async streamMessage(userId: string, sessionId: string, content: string, res: any, mode: 'search' | 'explore' | 'recall' = 'search', regenerate: boolean = false) {
    const session = await ChatDao.findSession(sessionId, userId)
    if (!session) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Session not found' })}\n\n`)
      res.end()
      return
    }

    if (regenerate) {
      const lastMessages = await ChatDao.findRecentMessages(sessionId, 2)
      const idsToDelete: string[] = []
      if (lastMessages.length > 0 && lastMessages[0].role === 'assistant') {
        idsToDelete.push(lastMessages[0].id)
        if (lastMessages.length > 1 && lastMessages[1].role === 'user') {
          idsToDelete.push(lastMessages[1].id)
        }
      }
      if (idsToDelete.length > 0) {
        await ChatDao.deleteMessages(idsToDelete)
      }
    }

    const [contextItems, rawHistory] = await Promise.all([
      ItemsService.searchItems(userId, content, 3),
      ChatDao.findRecentMessages(sessionId, 5)
    ])

    const isFirstMessage = rawHistory.length === 0
    const history = [...rawHistory].reverse()

    // Semantic Resurfacing Hook
    try {
      const { ReminderService } = await import('../memory/reminder.service')
      for (const item of contextItems as any[]) {
        if (item.createdAt) {
          const daysOld = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          if (daysOld >= 0) {
            const { getIo } = await import('../../socket/socket')
            getIo().to(userId).emit('memory:resurface', {
              message: `You saved this similar memory ${ReminderService.getTimeAgo(new Date(item.createdAt))}.`,
              item: item
            });
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed semantic resurface hook:', e)
    }

    res.write(`event: context\ndata: ${JSON.stringify(contextItems)}\n\n`)

    const systemPrompt = buildContextPrompt(contextItems, mode)
    const messages = formatChatHistory(history as any, systemPrompt)
    messages.push(new HumanMessage(wrapUserPrompt(content)))

    ChatDao.saveMessage({ chatSessionId: sessionId, role: 'user', content }).catch(e => console.error('Failed to save user message:', e))

    const llm = LangchainClient.getChatInstance()
    let replyContent = ''

    try {
      const stream = await llm.stream(messages)
      for await (const chunk of stream) {
        if (chunk.content) {
          replyContent += chunk.content
          res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        }
      }
    } catch (err: any) {
      console.error('LLM Stream Error:', err)
      res.write(`event: error\ndata: ${JSON.stringify({ message: err?.message || 'Processing error' })}\n\n`)
      res.end()
      return
    }

    const aiMessage = await ChatDao.saveMessage({
      chatSessionId: sessionId,
      role: 'assistant',
      content: replyContent,
      context: contextItems,
    })

    if (isFirstMessage) {
      let newTitle = content.length > 30 ? content.substring(0, 30) + '...' : content
      try {
        const titleResponse = await llm.invoke([
          new SystemMessage("You are a helpful assistant. Generate a short descriptive title for this conversation."),
          new HumanMessage(content)
        ])
        newTitle = titleResponse.content.toString().replace(/["']/g, '').trim()
      } catch (err) {
        console.error('Failed auto-title:', err)
      }
      await ChatDao.updateSessionTitle(sessionId, newTitle)
    } else {
      await ChatDao.updateSessionTimestamp(sessionId)
    }

    res.write(`event: done\ndata: ${JSON.stringify(aiMessage)}\n\n`)
    res.end()
  }
}

