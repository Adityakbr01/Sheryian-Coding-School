import embeddings from '../config/embedding.config'
import prisma from '../config/db'
import { logger } from '../utils/logger'

/**
 * Generates a 1024-dimensional vector embedding for the given text
 * using Mistral AI
 */
export const generateEmbedding = async (
  text: string,
): Promise<number[] | null> => {
  try {
    const embedder = embeddings

    // Limit text size to prevent token length overflow on large texts
    const safeText = text.substring(0, 8000)

    logger.info(
      `[Embedder] Generating 1024-d vector for ${safeText.length} chars...`,
    )
    const vector = await embedder.embedQuery(safeText)
    logger.info(
      `[Embedder] ✅ Generated vector with ${vector.length} dimensions`,
    )
    return vector
  } catch (error) {
    logger.error('[Embedder] ❌ Failed to generate embedding', error)
    return null
  }
}

/**
 * Stores the raw vector directly into the Item table via explicit SQL
 * because Prisma's `Unsupported` type prevents ORM inserts
 */
export const storeItemEmbedding = async (
  itemId: string,
  vector: number[],
): Promise<boolean> => {
  try {
    // Format array for pgvector string ingestion (e.g. '[0.1, 0.2, ...]')
    const vectorString = `[${vector.join(',')}]`

    logger.info(
      `[Embedder] Storing ${vector.length}-d vector for item ${itemId}...`,
    )

    await prisma.$executeRaw`
                UPDATE "Item" 
                SET embedding = ${vectorString}::vector 
                WHERE id = ${itemId};
            `

    logger.info(`[Embedder] ✅ Vector stored for item ${itemId}`)
    return true
  } catch (error) {
    logger.error(
      `[Embedder] ❌ Failed to store vector for item ${itemId}`,
      error,
    )
    return false
  }
}

