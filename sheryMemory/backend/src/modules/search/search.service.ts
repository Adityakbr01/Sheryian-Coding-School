import prisma from '../../config/db'
import { EmbedderService } from '../../ai/embedder.service'
import { AppError } from '../../utils/AppError'

export class SearchService {
    static async searchItems(userId: string, query: string, limit: number = 10) {
        // 1. Generate embedding for the search query
        const queryVector = await EmbedderService.generateEmbedding(query)

        if (!queryVector) {
            throw new AppError('Failed to generate search embeddings', 500)
        }

        const vectorString = `[${queryVector.join(',')}]`

        // 2. Perform raw SQL pgvector Cosine Similarity search (<=> operator)
        // We ensure we only search within the user's own items
        const results = await prisma.$queryRaw`
            SELECT id, url, title, type, status, content, "collectionId", "createdAt", "updatedAt",
                   1 - (embedding <=> ${vectorString}::vector) as similarity
            FROM "Item"
            WHERE "userId" = ${userId} AND status = 'processed'
            ORDER BY embedding <=> ${vectorString}::vector
            LIMIT ${limit};
        `

        return results
    }
}
