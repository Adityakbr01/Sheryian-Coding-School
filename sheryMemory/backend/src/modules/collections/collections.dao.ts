import prisma from '../../config/db'
import { CreateCollectionInput, UpdateCollectionInput } from './collections.schema'

export const CollectionsDao = {
  async create(userId: string, data: CreateCollectionInput) {
    return prisma.collection.create({
      data: {
        userId,
        name: data.name,
      },
    })
  },

  async findAllByUser(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true } },
      },
    })
  },

  async findById(id: string, userId: string) {
    return prisma.collection.findFirst({
      where: { id, userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            tags: { include: { tag: true } },
          },
        },
      },
    })
  },

  async findBasicById(id: string, userId: string) {
    return prisma.collection.findFirst({
      where: { id, userId },
    })
  },

  async update(id: string, data: UpdateCollectionInput) {
    return prisma.collection.update({
      where: { id },
      data: { name: data.name },
    })
  },

  async delete(id: string) {
    return prisma.collection.delete({ where: { id } })
  },

  async unlinkItemsFromCollection(collectionId: string) {
    return prisma.item.updateMany({
      where: { collectionId },
      data: { collectionId: null },
    })
  },

  async findItemById(itemId: string, userId: string, collectionId?: string) {
    return prisma.item.findFirst({
      where: { 
        id: itemId, 
        userId,
        ...(collectionId ? { collectionId } : {})
      },
    })
  },

  async updateItemCollection(itemId: string, collectionId: string | null) {
    return prisma.item.update({
      where: { id: itemId },
      data: { collectionId },
    })
  },
}
