import prisma from '../../config/db'

export const HighlightsDao = {
  async create(data: {
    userId: string
    itemId: string
    section: string
    text: string
    start: number
    end: number
    color: string
  }) {
    return prisma.highlight.create({
      data,
    })
  },

  async count(where: any) {
    return prisma.highlight.count({ where })
  },

  async findMany(params: {
    where: any
    orderBy: any
    skip: number
    take: number
    include?: any
  }) {
    return prisma.highlight.findMany(params)
  },

  async findByItem(userId: string, itemId: string) {
    return prisma.highlight.findMany({
      where: { userId, itemId },
      orderBy: { start: 'asc' },
    })
  },

  async delete(highlightId: string, userId: string) {
    return prisma.highlight.deleteMany({
      where: { id: highlightId, userId },
    })
  },

  async deleteByItem(userId: string, itemId: string) {
    return prisma.highlight.deleteMany({
      where: { userId, itemId },
    })
  },

  async paginateHighlights(params: {
    where: any
    orderBy: any
    page: number
    limit: number
    include?: any
  }) {
    const { where, orderBy, page, limit, include } = params
    const skip = (page - 1) * limit
    
    const [total, data] = await prisma.$transaction([
      prisma.highlight.count({ where }),
      prisma.highlight.findMany({
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
