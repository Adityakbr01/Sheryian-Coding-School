import { logger } from '../../utils/logger'
import { SearchDao } from './search.dao'

export const SimilarityService = {
  /**
   * Finds and links conceptually similar items within the user's repository.
   */
  async linkSimilarItems(
    sourceItemId: string,
    userId: string,
  ): Promise<number> {
    try {
      // 1. Fetch the source item's embedding vector
      const sourceResults = await SearchDao.findItemEmbedding(sourceItemId)

      if (!sourceResults || sourceResults.length === 0 || !sourceResults[0].embedding) {
        logger.warn(`[Similarity] Source item ${sourceItemId} has no vector. Skipping similarity linkage.`)
        return 0
      }

      const vectorString = sourceResults[0].embedding

      // 2. Find similar items based on cosine distance threshold
      const matches = await SearchDao.findSimilarItems(userId, sourceItemId, vectorString, 0.70, 5)

      let linksCreated = 0

      // 3. Map semantic relationships in the database
      for (const match of matches) {
        await SearchDao.upsertRelation(sourceItemId, match.id, match.similarity)
        linksCreated++
      }

      if (linksCreated > 0) {
        logger.info(`[Similarity] Successfully linked item ${sourceItemId} to ${linksCreated} other concepts!`)
      }

      return linksCreated
    } catch (error) {
      logger.error(`[Similarity] Failed to link similar items to ${sourceItemId}`, error)
      return 0
    }
  },
}

