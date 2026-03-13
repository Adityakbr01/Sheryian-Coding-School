import prisma from '../../config/db'
import { CreateCollectionInput, UpdateCollectionInput } from './collections.schema'
import { AppError } from '../../utils/AppError'

export class CollectionsService {
    static async create(userId: string, data: CreateCollectionInput) {
        return prisma.collection.create({
            data: {
                userId,
                name: data.name
            }
        })
    }

    static async getAll(userId: string) {
        return prisma.collection.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { items: true } }
            }
        })
    }

    static async getById(userId: string, id: string) {
        const collection = await prisma.collection.findFirst({
            where: { id, userId },
            include: {
                items: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        tags: { include: { tag: true } }
                    }
                }
            }
        })

        if (!collection) {
            throw new AppError('Collection not found', 404)
        }

        return collection
    }

    static async update(userId: string, id: string, data: UpdateCollectionInput) {
        const collection = await prisma.collection.findFirst({
            where: { id, userId }
        })

        if (!collection) {
            throw new AppError('Collection not found', 404)
        }

        return prisma.collection.update({
            where: { id },
            data: { name: data.name }
        })
    }

    static async delete(userId: string, id: string) {
        const collection = await prisma.collection.findFirst({
            where: { id, userId }
        })

        if (!collection) {
            throw new AppError('Collection not found', 404)
        }

        // Remove collection reference from items first, then delete
        await prisma.item.updateMany({
            where: { collectionId: id },
            data: { collectionId: null }
        })

        await prisma.collection.delete({ where: { id } })
        return { success: true }
    }

    static async addItem(userId: string, collectionId: string, itemId: string) {
        // Verify both exist and belong to the user
        const [collection, item] = await Promise.all([
            prisma.collection.findFirst({ where: { id: collectionId, userId } }),
            prisma.item.findFirst({ where: { id: itemId, userId } })
        ])

        if (!collection) throw new AppError('Collection not found', 404)
        if (!item) throw new AppError('Item not found', 404)

        return prisma.item.update({
            where: { id: itemId },
            data: { collectionId }
        })
    }

    static async removeItem(userId: string, collectionId: string, itemId: string) {
        const item = await prisma.item.findFirst({
            where: { id: itemId, userId, collectionId }
        })

        if (!item) throw new AppError('Item not found in this collection', 404)

        return prisma.item.update({
            where: { id: itemId },
            data: { collectionId: null }
        })
    }
}
