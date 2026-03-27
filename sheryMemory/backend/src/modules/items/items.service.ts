import prisma from '../../config/db'
import { SaveItemInput } from './items.schema'
import { addUrlToQueue } from '../../queue/items.queue'
import { EmbedderService } from '../../ai/embedder.service'
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
     * Retrieves a single item by its ID.
     */
    static async getItemById(userId: string, itemId: string) {
        const item = await prisma.item.findFirst({
            where: {
                id: itemId,
                userId: userId,
            },
            include: {
                collection: true,
                tags: {
                    include: { tag: true }
                }
            }
        })

        if (!item) {
            throw new AppError('Item not found', 404)
        }

        return item
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

    /**
     * Normalizes a search query for consistent database querying.
     * Trims whitespace, lowercases, and removes excessive special characters.
     */
    static normalizeQuery(query: string): string {
        // Keeps alphanumeric, spaces, and optionally Hindi unicode blocks \u0900-\u097F
        return query.trim().toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, '')
    }

    /**
     * Performs a production-grade Hybrid Search (Semantic + Keyword)
     * against the user's memory repository using vector embeddings.
     */
    static async searchItems(userId: string, rawQuery: string, limit: number = 10) {
        const query = this.normalizeQuery(rawQuery)

        // Fast-fail: Ignore single-character queries to save compute, but allow 2+ chars like "ai", "js", "go", "git"
        if (query.length < 2) {
            logger.info(`[Items] 🚫 Query "${query}" too short. Skipping vector search.`)
            return []
        }

        logger.info(`[Items] 🔍 Executing Hybrid Search for user ${userId} with normalized query: "${query}"`)

        const queryVector = await EmbedderService.generateEmbedding(query)
        if (!queryVector) {
            throw new AppError('Failed to generate search embedding', 500)
        }

        const vectorString = `[${queryVector.join(',')}]`

        // Execute Hybrid Vector + ILIKE Search using PostgreSQL CTE
        // Semantic score comes from pgvector `<=>` (cosine distance)
        // Keyword score uses ILIKE string match multipliers mapping heavily to identical phrases
        const items = await prisma.$queryRaw<any[]>`
            WITH semantic_search AS (
                SELECT id, url, title, type, status, summary, "imageUrl", "createdAt",
                       1 - (embedding <=> CAST(${vectorString} AS vector)) as semantic_score,
                       (
                            CASE WHEN title ILIKE ${'%' + query + '%'} THEN 0.2 ELSE 0 END +
                            CASE WHEN summary ILIKE ${'%' + query + '%'} THEN 0.1 ELSE 0 END +
                            CASE WHEN content ILIKE ${'%' + query + '%'} THEN 0.05 ELSE 0 END
                       ) as keyword_score
                FROM "Item"
                WHERE "userId" = ${userId}
                  AND "status" = 'processed'
                  AND embedding IS NOT NULL
            )
            SELECT *, (semantic_score + keyword_score) as final_score
            FROM semantic_search
            WHERE (semantic_score + keyword_score) > 0.52
            ORDER BY final_score DESC
            LIMIT ${Number(limit)};
        `

        logger.info(`[Items] 🎯 Hybrid Search results for "${query}":`)
        items.forEach((item, index) => {
            const semScore = typeof item.semantic_score === 'number' ? item.semantic_score : parseFloat(item.semantic_score)
            const kwScore = typeof item.keyword_score === 'number' ? item.keyword_score : parseFloat(item.keyword_score)
            const finalScore = typeof item.final_score === 'number' ? item.final_score : parseFloat(item.final_score)

            logger.info(`  ${index + 1}. [Total: ${finalScore.toFixed(4)} | Sem: ${semScore.toFixed(4)} | KW: ${kwScore.toFixed(4)}] ${item.title || item.url}`)
        })

        return items
    }
}
