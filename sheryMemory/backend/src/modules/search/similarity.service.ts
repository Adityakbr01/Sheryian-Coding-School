import prisma from '../../config/db'
import { logger } from '../../utils/logger'

export class SimilarityService {
  /**
   * Finds and links the top 5 most similar items conceptually
   * based on cosine similarity > 0.70 via pgvector.
   */
  static async linkSimilarItems(
    sourceItemId: string,
    userId: string,
  ): Promise<number> {
    try {
      // First, get the source item's vector
      const sourceItem: any[] = await prisma.$queryRaw`
                SELECT embedding::text FROM "Item" WHERE id = ${sourceItemId} AND embedding IS NOT NULL;
            `

      if (!sourceItem || sourceItem.length === 0 || !sourceItem[0].embedding) {
        logger.warn(
          `[Similarity] Source item ${sourceItemId} has no vector. Skipping similarity linkage.`,
        )
        return 0
      }

      const vectorString = sourceItem[0].embedding

      // Find similar items (cosine similarity > 0.70 means distance < 0.30)
      // Note: 1 - (embedding <=> query) is the similarity
      const queryRaw = prisma.$queryRaw`
                SELECT id, 1 - (embedding <=> ${vectorString}::vector) as similarity
                FROM "Item"
                WHERE "userId" = ${userId} 
                  AND id != ${sourceItemId}
                  AND status = 'processed'
                  AND embedding IS NOT NULL
                  AND (1 - (embedding <=> ${vectorString}::vector)) > 0.70
                ORDER BY embedding <=> ${vectorString}::vector
                LIMIT 5;
            `

      const matches = (await queryRaw) as any[]
      let linksCreated = 0

      for (const match of matches) {
        // Upsert relationship both ways or single way?
        // The schema definition sets sourceId and targetId uniquely.
        await prisma.relation.upsert({
          where: {
            sourceId_targetId: {
              sourceId: sourceItemId,
              targetId: match.id,
            },
          },
          update: {
            score: match.similarity,
          },
          create: {
            sourceId: sourceItemId,
            targetId: match.id,
            score: match.similarity,
          },
        })
        linksCreated++
      }

      if (linksCreated > 0) {
        logger.info(
          `[Similarity] Successfully linked item ${sourceItemId} to ${linksCreated} other concepts!`,
        )
      }

      return linksCreated
    } catch (error) {
      logger.error(
        `[Similarity] Failed to link similar items to ${sourceItemId}`,
        error,
      )
      return 0
    }
  }
}
