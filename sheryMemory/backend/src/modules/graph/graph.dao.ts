import prisma from '../../config/db'

export const GraphDao = {
  async findItemsForGraph(userId: string, limit: number = 50) {
    return prisma.item.findMany({
      where: { userId, status: 'processed' },
      select: {
        id: true,
        title: true,
        type: true,
        url: true,
        summary: true,
        imageUrl: true,
        collectionId: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },

  async findRelationsForGraph(itemIds: string[], threshold: number = 0.7) {
    return prisma.relation.findMany({
      where: {
        sourceId: { in: itemIds },
        targetId: { in: itemIds },
        score: { gte: threshold },
      },
    })
  },

  async syncRelationsRaw(userId: string) {
    return prisma.$executeRaw`
      INSERT INTO "Relation" ("id", "sourceId", "targetId", "score", "createdAt")
      SELECT 
         gen_random_uuid()::text as id, 
         a.id as "sourceId", 
         b.id as "targetId", 
         1 - (a.embedding <=> b.embedding) as score,
         now() as "createdAt"
      FROM "Item" a
      JOIN "Item" b ON a."userId" = b."userId" AND a.id < b.id
      WHERE a."userId" = ${userId}
        AND a.embedding IS NOT NULL 
        AND b.embedding IS NOT NULL
        AND 1 - (a.embedding <=> b.embedding) > 0.70
      ON CONFLICT ("sourceId", "targetId") DO UPDATE 
         SET score = EXCLUDED.score;
    `
  },

  async findRelationsByItemId(itemId: string, threshold: number = 0.7, limit: number = 10) {
    return prisma.relation.findMany({
      where: {
        OR: [{ sourceId: itemId }, { targetId: itemId }],
        score: { gte: threshold },
      },
      orderBy: { score: 'desc' },
      take: limit,
    })
  },

  async findRelatedItems(itemIds: string[], userId: string) {
    return prisma.item.findMany({
      where: {
        id: { in: itemIds },
        userId,
      },
      select: {
        id: true,
        title: true,
        url: true,
        type: true,
        summary: true,
        tags: {
          include: { tag: true },
          take: 3,
        },
      },
    })
  },
}
