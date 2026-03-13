import prisma from '../../config/db'
import { SaveItemInput } from './items.schema'
import { addUrlToQueue } from '../../queue/items.queue'
import { AppError } from '../../utils/AppError'
import { logger } from '../../utils/logger'

export class ItemsService {
    /**
     * Saves a new item to the database with 'pending' status.
     */
    static async saveItem(userId: string, data: SaveItemInput) {
        logger.info(`[Items] 📝 Creating item for user ${userId}: ${data.url}`)

        const item = await prisma.item.create({
            data: {
                userId,
                url: data.url,
                collectionId: data.collectionId,
                type: 'article',
                status: 'pending',
            },
        })

        logger.info(`[Items] ✅ Item created: ${item.id}`)
        logger.info(`[Items] 📤 Pushing to queue...`)

        await addUrlToQueue(item.id, item.url)

        logger.info(`[Items] ✅ Queued for background processing`)

        return item
    }

    /**
     * Retrieves all items for a given user, optionally filtered by collection.
     */
    static async getItems(userId: string, collectionId?: string) {
        return prisma.item.findMany({
            where: {
                userId,
                ...(collectionId ? { collectionId } : {})
            },
            orderBy: { createdAt: 'desc' },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        })
    }

    /**
     * Deletes a specific item belonging to the user.
     */
    static async deleteItem(userId: string, itemId: string) {
        // Delete only if it belongs to this user
        const deleted = await prisma.item.deleteMany({
            where: {
                id: itemId,
                userId: userId,
            },
        })

        if (deleted.count === 0) {
            throw new AppError('Item not found or unauthorized', 404)
        }

        return { success: true }
    }
}
