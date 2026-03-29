import { Prisma } from '@prisma/client'
import prisma from '../../config/db'

export const ChatDao = {
  async getSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async createSession(userId: string, title: string = 'New Chat') {
    return prisma.chatSession.create({
      data: { userId, title },
    })
  },

  async findSession(sessionId: string, userId: string) {
    return prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    })
  },

  async getMessages(sessionId: string) {
    return prisma.chatMessage.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async findRecentMessages(sessionId: string, take: number = 5) {
    return prisma.chatMessage.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
      take,
      select: { role: true, content: true, id: true }
    })
  },

  async saveMessage(data: { chatSessionId: string; role: 'user' | 'assistant'; content: string; context?: any }) {
    return prisma.chatMessage.create({
      data: {
        chatSessionId: data.chatSessionId,
        role: data.role,
        content: data.content,
        context: data.context ? (data.context as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    })
  },

  async updateSessionTitle(sessionId: string, title: string) {
    return prisma.chatSession.update({
      where: { id: sessionId },
      data: { title, updatedAt: new Date() },
    })
  },

  async updateSessionTimestamp(sessionId: string) {
    return prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })
  },

  async deleteSession(sessionId: string, userId: string) {
    return prisma.chatSession.deleteMany({
      where: { id: sessionId, userId },
    })
  },

  async deleteMessages(messageIds: string[]) {
    return prisma.chatMessage.deleteMany({
      where: { id: { in: messageIds } },
    })
  },
}
