import { getVectorStore } from './embedder.service'

/**
 * Searches the PGVector DB for items semantically similar to the given query.
 */
export async function searchSimilarItems(query: string, limit: number = 5) {
  try {
    const vectorStore = await getVectorStore()

    // similaritySearch returns an array of Document objects
    // array of [Document, score] is also possible via similaritySearchWithScore
    const results = await vectorStore.similaritySearch(query, limit)

    return results.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    }))
  } catch (error) {
    console.error('Failed to perform similarity search:', error)
    return []
  }
}
