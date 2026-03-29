import { logger } from '../../utils/logger'
import { HighlightsDao } from './highlights.dao'

export const HighlightService = {
  /**
   * Create a new highlight for an item.
   */
  async create(
    userId: string,
    data: {
      itemId: string
      section: string
      text: string
      start: number
      end: number
      color: string
    },
  ) {
    logger.info(
      `[Highlights] ✨ Creating highlight for item ${data.itemId} section="${data.section}"`,
    )

    const highlight = await HighlightsDao.create({
      userId,
      ...data,
    })

    logger.info(`[Highlights] ✅ Created highlight ${highlight.id}`)
    return highlight
  },

  /**
   * Get ALL highlights for a user (for the dashboard page).
   * Includes the parent item's title for display context.
   */
  async getAll(userId: string, color?: string, page: number = 1, limit: number = 12, search?: string, sortBy?: string) {
    const whereParams: any = {
      userId,
      ...(color && color !== 'all' ? { color } : {}),
      ...(search ? {
        OR: [
          { text: { contains: search, mode: 'insensitive' } },
          { item: { title: { contains: search, mode: 'insensitive' } } }
        ]
      } : {})
    }

    let orderByParams: any = { createdAt: 'desc' }
    if (sortBy === 'oldest') {
      orderByParams = { createdAt: 'asc' }
    }

    const { data, total } = await HighlightsDao.paginateHighlights({
      where: whereParams,
      orderBy: orderByParams,
      page: Number(page),
      limit: Number(limit),
      include: {
        item: {
          select: {
            id: true,
            title: true,
            url: true,
            type: true,
            imageUrl: true,
          },
        },
      },
    })

    return { 
      data, 
      total, 
      page: Number(page), 
      limit: Number(limit), 
      totalPages: Math.ceil(total / Number(limit)) 
    }
  },

  /**
   * Get all highlights for a specific item belonging to the authenticated user.
   */
  async getByItemId(userId: string, itemId: string) {
    return HighlightsDao.findByItem(userId, itemId)
  },

  /**
   * Delete a highlight by ID (only if it belongs to the user).
   */
  async delete(userId: string, highlightId: string) {
    const deleted = await HighlightsDao.delete(highlightId, userId)

    if (deleted.count === 0) {
      throw new Error('Highlight not found or unauthorized')
    }

    logger.info(`[Highlights] 🗑️ Deleted highlight ${highlightId}`)
    return { success: true }
  },

  /**
   * Delete ALL highlights for a specific item (clear all).
   */
  async clearByItemId(userId: string, itemId: string) {
    const deleted = await HighlightsDao.deleteByItem(userId, itemId)

    logger.info(
      `[Highlights] 🧹 Cleared ${deleted.count} highlights for item ${itemId}`,
    )
    return { count: deleted.count }
  },
}

