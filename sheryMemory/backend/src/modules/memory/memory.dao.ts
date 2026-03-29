import prisma from '../../config/db'

export const MemoryDao = {
  async findUserProcessedItems(userId: string) {
    return prisma.item.findMany({
      where: {
        userId,
        status: 'processed',
      },
      include: {
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  },

  async findItemById(itemId: string, userId?: string) {
    return prisma.item.findUnique({
      where: { 
        id: itemId,
        ...(userId ? { userId } : {})
      },
    })
  },

  async updateItemReview(itemId: string, data: { lastReviewedAt: Date; reviewCount: { increment: number } }) {
    return prisma.item.update({
      where: { id: itemId },
      data,
    })
  },

  async findResurfacePool(userId: string, count: number) {
    return prisma.item.findMany({
      where: { userId, status: 'processed' },
      include: { tags: { include: { tag: true } } },
      orderBy: [{ reviewCount: 'asc' }, { createdAt: 'asc' }],
      take: count,
    })
  },
}
