import prisma from '../../config/db'

export const SearchDao = {
  async vectorSearch(userId: string, vectorString: string, limit: number = 10) {
    return prisma.$queryRaw<any[]>`
      SELECT id, url, title, type, status, content, "collectionId", "createdAt", "updatedAt",
             1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "Item"
      WHERE "userId" = ${userId} AND status = 'processed'
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit};
    `
  },

  async findItemEmbedding(itemId: string) {
    return prisma.$queryRaw<any[]>`
      SELECT embedding::text FROM "Item" WHERE id = ${itemId} AND embedding IS NOT NULL;
    `
  },

  async findSimilarItems(userId: string, sourceItemId: string, vectorString: string, threshold: number = 0.7, limit: number = 5) {
    return prisma.$queryRaw<any[]>`
      SELECT id, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "Item"
      WHERE "userId" = ${userId} 
        AND id != ${sourceItemId}
        AND status = 'processed'
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> ${vectorString}::vector)) > ${threshold}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit};
    `
  },

  async upsertRelation(sourceId: string, targetId: string, score: number) {
    return prisma.relation.upsert({
      where: {
        sourceId_targetId: {
          sourceId,
          targetId,
        },
      },
      update: {
        score,
      },
      create: {
        sourceId,
        targetId,
        score,
      },
    })
  },
}
