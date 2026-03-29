import { generateEmbedding } from '../../ai/embedder.service'
import { AppError } from '../../utils/AppError'
import { SearchDao } from './search.dao'

export const SearchService = {
  /**
   * Perform semantic vector search within the user's processed items.
   */
  async searchItems(userId: string, query: string, limit: number = 10) {
    // 1. Generate embedding for the search query
    const queryVector = await generateEmbedding(query)

    if (!queryVector) {
      throw new AppError('Failed to generate search embeddings', 500)
    }

    const vectorString = `[${queryVector.join(',')}]`

    // 2. Perform raw SQL pgvector Cosine Similarity search
    return SearchDao.vectorSearch(userId, vectorString, limit)
  },
}

