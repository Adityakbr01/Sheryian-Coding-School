import { SaveItemInput } from './items.schema'
import { addUrlToQueue } from '../../queue/items.queue'
import { generateEmbedding } from '../../ai/embedder.service'
import { AppError } from '../../utils/AppError'
import { logger } from '../../utils/logger'
import { ItemsDao } from './items.dao'

export const ItemsService = {
  /**
   * Saves a new item to the database with 'pending' status.
   */
  async saveItem(userId: string, data: SaveItemInput) {
    logger.info(`[Items] 📝 Creating item for user ${userId}: ${data.url}`)

    const item = await ItemsDao.create(userId, data)

    logger.info(`[Items] ✅ Item created: ${item.id}`)
    logger.info(`[Items] 📤 Pushing to queue...`)

    await addUrlToQueue(item.id, item.url as string)

    logger.info(`[Items] ✅ Queued for background processing`)

    return item
  },

  /**
   * Retrieves all items for a given user, optionally filtered by collection.
   */
  async getItems(userId: string, filters?: { collectionId?: string; type?: string; status?: string; tags?: string; page?: number; limit?: number }) {
    const { collectionId, type, status, tags, page = 1, limit = 12 } = filters || {};
    const tagsArray = tags ? tags.split(',').map(t => t.trim()) : undefined;

    const whereParams = {
      userId,
      ...(collectionId === 'uncategorized' ? { collectionId: null } : collectionId ? { collectionId } : {}),
      ...(type && type !== 'all' ? { type } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(tagsArray && tagsArray.length > 0 ? {
        tags: { some: { tag: { name: { in: tagsArray } } } }
      } : {})
    };

    const { data, total } = await ItemsDao.paginateItems({
      where: whereParams,
      orderBy: { createdAt: 'desc' },
      page: Number(page),
      limit: Number(limit),
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    return { 
      data, 
      total, 
      page: Number(page), 
      limit: Number(limit), 
      totalPages: Math.ceil(total / Number(limit)) 
    }
  },

  /**
   * Retrieves a single item by its ID.
   */
  async getItemById(userId: string, itemId: string) {
    const item = await ItemsDao.findById(itemId, userId)
    if (!item) {
      throw new AppError('Item not found', 404)
    }
    return item
  },

  /**
   * Deletes a specific item belonging to the user.
   */
  async deleteItem(userId: string, itemId: string) {
    const deleted = await ItemsDao.delete(itemId, userId)
    if (deleted.count === 0) {
      throw new AppError('Item not found or unauthorized', 404)
    }
    return { success: true }
  },

  /**
   * Normalizes a search query for consistent database querying.
   */
  normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, '')
  },

  /**
   * Performs a production-grade Hybrid Search (Semantic + Keyword)
   */
  async searchItems(
    userId: string,
    rawQuery: string,
    limit: number = 10,
  ) {
    const query = this.normalizeQuery(rawQuery)

    if (query.length < 2) {
      logger.info(`[Items] 🚫 Query "${query}" too short. Skipping vector search.`)
      return []
    }

    logger.info(`[Items] 🔍 Executing Hybrid Search for user ${userId} with normalized query: "${query}"`)

    const queryVector = await generateEmbedding(query)
    if (!queryVector) {
      throw new AppError('Failed to generate search embedding', 500)
    }

    const vectorString = `[${queryVector.join(',')}]`

    const items = await ItemsDao.hybridSearch(userId, vectorString, query, limit)

    logger.info(`[Items] 🎯 Hybrid Search results for "${query}":`)
    items.forEach((item, index) => {
      const semScore = typeof item.semantic_score === 'number' ? item.semantic_score : parseFloat(item.semantic_score)
      const kwScore = typeof item.keyword_score === 'number' ? item.keyword_score : parseFloat(item.keyword_score)
      const finalScore = typeof item.final_score === 'number' ? item.final_score : parseFloat(item.final_score)

      logger.info(
        `  ${index + 1}. [Total: ${finalScore.toFixed(4)} | Sem: ${semScore.toFixed(4)} | KW: ${kwScore.toFixed(4)}] ${item.title || item.url}`,
      )
    })

    return items
  },
}

