import { getIo } from '../../socket/socket';
import { logger } from '../../utils/logger';
import { MemoryDao } from './memory.dao';

export const ReminderService = {
  /**
   * Translates a Date into a human-readable "time ago" string.
   */
  getTimeAgo(date: Date): string {
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days === 7) return 'exactly a week ago';
    if (days === 30) return 'a month ago';
    if (days > 30) return `${Math.floor(days / 30)} months ago`;
    return `${days} days ago`;
  },

  /**
   * Smart logic to prevent spamming the user.
   */
  async shouldResurface(itemId: string): Promise<any> {
    const item = await MemoryDao.findItemById(itemId);
    
    if (!item) return null;
    
    // Do not resurface failed items
    if (item.status === 'failed') return null;

    // Do not resurface if the user has recently reviewed it (within 3 days)
    if (item.lastReviewedAt) {
      const daysSinceReview = Math.floor((new Date().getTime() - item.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceReview < 3) return null;
    }

    return item;
  },

  /**
   * Executes the push via Socket.io to the specific user's room.
   */
  async processItemReminder(userId: string, itemId: string, intervalName: string) {
    try {
      const item = await this.shouldResurface(itemId);
      if (!item) return;

      const timeAgo = this.getTimeAgo(item.createdAt);
      
      const io = getIo();
      // Emitting only to the specific user's private room
      io.to(userId).emit('memory:resurface', {
        message: `You saved this ${timeAgo}. Time to revisit?`,
        item: {
          id: item.id,
          title: item.title || item.url,
          url: item.url,
          summary: item.summary,
          type: item.type,
          interval: intervalName
        }
      });
      
      logger.info(`[ReminderService] Emitted resurface event for item ${itemId} to user ${userId}`);
    } catch (error) {
      logger.error(`[ReminderService] Failed to process reminder:`, error);
    }
  },
}

