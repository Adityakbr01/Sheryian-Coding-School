import prisma from '../../config/db'
import { logger } from '../../utils/logger'

export class HighlightService {
  /**
   * Create a new highlight for an item.
   */
  static async create(
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

    const highlight = await prisma.highlight.create({
      data: {
        userId,
        itemId: data.itemId,
        section: data.section,
        text: data.text,
        start: data.start,
        end: data.end,
        color: data.color,
      },
    })

    logger.info(`[Highlights] ✅ Created highlight ${highlight.id}`)
    return highlight
  }

  /**
   * Get ALL highlights for a user (for the dashboard page).
   * Includes the parent item's title for display context.
   */
  static async getAll(userId: string, color?: string) {
    return prisma.highlight.findMany({
      where: {
        userId,
        ...(color ? { color } : {}),
      },
      orderBy: { createdAt: 'desc' },
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
  }

  /**
   * Get all highlights for a specific item belonging to the authenticated user.
   */
  static async getByItemId(userId: string, itemId: string) {
    return prisma.highlight.findMany({
      where: { userId, itemId },
      orderBy: { start: 'asc' },
    })
  }

  /**
   * Delete a highlight by ID (only if it belongs to the user).
   */
  static async delete(userId: string, highlightId: string) {
    const deleted = await prisma.highlight.deleteMany({
      where: { id: highlightId, userId },
    })

    if (deleted.count === 0) {
      throw new Error('Highlight not found or unauthorized')
    }

    logger.info(`[Highlights] 🗑️ Deleted highlight ${highlightId}`)
    return { success: true }
  }

  /**
   * Delete ALL highlights for a specific item (clear all).
   */
  static async clearByItemId(userId: string, itemId: string) {
    const deleted = await prisma.highlight.deleteMany({
      where: { userId, itemId },
    })

    logger.info(
      `[Highlights] 🧹 Cleared ${deleted.count} highlights for item ${itemId}`,
    )
    return { count: deleted.count }
  }
}
