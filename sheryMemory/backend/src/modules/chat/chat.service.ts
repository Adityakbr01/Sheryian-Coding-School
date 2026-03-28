import prisma from '../../config/db'
import { LangchainClient } from '../../ai/langchain.client'
import { ItemsService } from '../items/items.service'
import { AppError } from '../../utils/AppError'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { buildContextPrompt, formatChatHistory, wrapUserPrompt } from './chat.utils'

export class ChatService {
  static async getSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  static async createSession(userId: string, title: string = 'New Chat') {
    return prisma.chatSession.create({
      data: { userId, title },
    })
  }

  static async getSessionMessages(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    })
    if (!session) throw new AppError('Session not found', 404)

    return prisma.chatMessage.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'asc' },
    })
  }

  static async sendMessage(userId: string, sessionId: string, content: string, mode: 'search' | 'explore' | 'recall' = 'search') {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true }
    })
    if (!session) throw new AppError('Session not found', 404)

    // Performance Optimization: Fetch context & history concurrently
    const [contextItems, rawHistory] = await Promise.all([
      ItemsService.searchItems(userId, content, 3),
      prisma.chatMessage.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { role: true, content: true }
      })
    ])

    const isFirstMessage = rawHistory.length === 0
    const history = rawHistory.reverse()

    // Save user message asynchronously
    prisma.chatMessage.create({
      data: { chatSessionId: sessionId, role: 'user', content }
    }).catch(e => console.error('Failed to save user message:', e))

    // Prepare Prompt using Utility
    const systemPrompt = buildContextPrompt(contextItems, mode)
    const messages = formatChatHistory(history, systemPrompt)
    messages.push(new HumanMessage(wrapUserPrompt(content)))

    // Call LLM
    const llm = LangchainClient.getChatInstance()
    const llmResponse = await llm.invoke(messages)
    const replyContent = llmResponse.content.toString()

    // Save AI reply
    const aiMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: replyContent,
        context: contextItems as any,
      },
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

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: newTitle, updatedAt: new Date() }
      })
    } else {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      })
    }

    return aiMessage
  }

  static async deleteSession(userId: string, sessionId: string) {
    const deleted = await prisma.chatSession.deleteMany({
      where: { id: sessionId, userId },
    })
    if (deleted.count === 0) throw new AppError('Session not found', 404)
    return { success: true }
  }

  static async streamMessage(userId: string, sessionId: string, content: string, res: any, mode: 'search' | 'explore' | 'recall' = 'search', regenerate: boolean = false) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true }
    })

    if (!session) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Session not found' })}\n\n`)
      res.end()
      return
    }

    if (regenerate) {
      const lastMessages = await prisma.chatMessage.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: 'desc' },
        take: 2
      })

      const idsToDelete: string[] = []
      if (lastMessages.length > 0 && lastMessages[0].role === 'assistant') {
        idsToDelete.push(lastMessages[0].id)
        if (lastMessages.length > 1 && lastMessages[1].role === 'user') {
          idsToDelete.push(lastMessages[1].id)
        }
      }

      if (idsToDelete.length > 0) {
        await prisma.chatMessage.deleteMany({
          where: { id: { in: idsToDelete } }
        })
      }
    }

    // Performance Optimization: Fetch context (top 3) & history concurrently
    const [contextItems, rawHistory] = await Promise.all([
      ItemsService.searchItems(userId, content, 3),
      prisma.chatMessage.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: 'desc' },
        take: 5, // History Optimization: only last 5 messages
        select: { role: true, content: true }
      })
    ])

    const isFirstMessage = rawHistory.length === 0
    const history = rawHistory.reverse() // Correct chronological order

    // Semantic Resurfacing Hook
    try {
      const { ReminderService } = await import('../memory/reminder.service')
      const SEMANTIC_RESURFACE_THRESHOLD_DAYS = 0; // Test: 0 days | Prod: 7 days

      for (const item of contextItems as any[]) {
        if (item.createdAt) {
          const daysOld = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          if (daysOld >= SEMANTIC_RESURFACE_THRESHOLD_DAYS) {
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

    // Stream context to UI immediately
    res.write(`event: context\ndata: ${JSON.stringify(contextItems)}\n\n`)

    // Extract utilities
    const systemPrompt = buildContextPrompt(contextItems, mode)
    const messages = formatChatHistory(history, systemPrompt)

    // Append current prompt
    messages.push(new HumanMessage(wrapUserPrompt(content)))

    // Run detached user message creation
    prisma.chatMessage.create({
      data: { chatSessionId: sessionId, role: 'user', content }
    }).catch(e => console.error('Failed to save user message:', e))

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
      const errMessage = err?.message || 'Unknown processing error'
      res.write(`event: error\ndata: ${JSON.stringify({ message: errMessage })}\n\n`)
      res.end()
      return
    }

    // Save final AI reply
    const aiMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: replyContent,
        context: contextItems as any,
      },
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

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: newTitle, updatedAt: new Date() }
      })
    } else {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      })
    }

    // Done
    res.write(`event: done\ndata: ${JSON.stringify(aiMessage)}\n\n`)
    res.end()
  }
}
