import { AppError } from '../../utils/AppError'
import { MemoryDao } from './memory.dao'

/**
 * Spaced repetition intervals in days.
 */
const INTERVALS = [1, 3, 7, 14, 30]

function getIntervalDays(reviewCount: number): number {
  return INTERVALS[Math.min(reviewCount, INTERVALS.length - 1)]
}

export const MemoryService = {
  /**
   * Returns items that are due for review based on spaced repetition intervals.
   */
  async getDueItems(userId: string) {
    const now = new Date()

    // Get all processed items for the user
    const items = await MemoryDao.findUserProcessedItems(userId)

    // Filter items that are due for review
    const dueItems = items.filter((item) => {
      const intervalDays = getIntervalDays(item.reviewCount)
      const intervalMs = intervalDays * 24 * 60 * 60 * 1000

      if (!item.lastReviewedAt) {
        // Never reviewed — due after 1 day since creation
        const timeSinceCreation = now.getTime() - item.createdAt.getTime()
        return timeSinceCreation >= 24 * 60 * 60 * 1000
      }

      // Check if enough time has passed since last review
      const timeSinceReview = now.getTime() - item.lastReviewedAt.getTime()
      return timeSinceReview >= intervalMs
    })

    return dueItems
  },

  /**
   * Marks an item as reviewed — bumps the reviewCount and sets lastReviewedAt to now.
   */
  async markReviewed(userId: string, itemId: string) {
    const item = await MemoryDao.findItemById(itemId, userId)
    if (!item) {
      throw new AppError('Item not found', 404)
    }

    return MemoryDao.updateItemReview(itemId, {
      lastReviewedAt: new Date(),
      reviewCount: { increment: 1 },
    })
  },

  /**
   * Gets a few random or highly-relevant items for the "Daily Knowledge" dashboard widget.
   */
  async getResurfacedItems(userId: string, count: number = 2) {
    // Fetch all processed items
    const items = await MemoryDao.findResurfacePool(userId, count * 3)

    // Shuffle the pool to give a fresh "Daily" feel
    const shuffled = items.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },
}

