import prisma from '../../config/db'
import { SaveItemInput } from './items.schema'

export const ItemsDao = {
  async create(userId: string, data: SaveItemInput) {
    return prisma.item.create({
      data: {
        userId,
        url: data.url as string,
        collectionId: data.collectionId,
        type: 'article',
        status: 'pending',
      },
    })
  },

  async count(where: any) {
    return prisma.item.count({ where })
  },

  async findMany(params: {
    where: any
    orderBy: any
    skip: number
    take: number
    include?: any
  }) {
    return prisma.item.findMany(params)
  },

  async findById(id: string, userId: string) {
    return prisma.item.findFirst({
      where: { id, userId },
      include: {
        collection: true,
        tags: {
          include: { tag: true },
        },
      },
    })
  },

  async delete(id: string, userId: string) {
    return prisma.item.deleteMany({
      where: { id, userId },
    })
  },

  async hybridSearch(userId: string, vectorString: string, query: string, limit: number) {
    return prisma.$queryRaw<any[]>`
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
  },

  async paginateItems(params: {
    where: any
    orderBy: any
    page: number
    limit: number
    include?: any
  }) {
    const { where, orderBy, page, limit, include } = params
    const skip = (page - 1) * limit
    
    const [total, data] = await prisma.$transaction([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
    ])

    return { data, total }
  },
}
