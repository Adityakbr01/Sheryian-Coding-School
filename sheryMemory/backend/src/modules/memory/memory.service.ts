import prisma from '../../config/db'
import { AppError } from '../../utils/AppError'

/**
 * Spaced repetition intervals in days.
 * After each review, the item moves to the next interval.
 * reviewCount 0 → due after 1 day
 * reviewCount 1 → due after 3 days
 * reviewCount 2 → due after 7 days
 * reviewCount 3 → due after 14 days
 * reviewCount 4+ → due after 30 days
 */
const INTERVALS = [1, 3, 7, 14, 30]

function getIntervalDays(reviewCount: number): number {
    return INTERVALS[Math.min(reviewCount, INTERVALS.length - 1)]
}

export class MemoryService {
    /**
     * Returns items that are due for review based on spaced repetition intervals.
     * An item is "due" if:
     *  - It has never been reviewed (lastReviewedAt is null) AND was created > 1 day ago
     *  - OR enough time has passed since the last review based on its reviewCount
     */
    static async getDueItems(userId: string) {
        const now = new Date()

        // Get all processed items for the user
        const items = await prisma.item.findMany({
            where: {
                userId,
                status: 'processed'
            },
            include: {
                tags: { include: { tag: true } }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Filter items that are due for review
        const dueItems = items.filter(item => {
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
    }

    /**
     * Marks an item as reviewed — bumps the reviewCount and sets lastReviewedAt to now.
     */
    static async markReviewed(userId: string, itemId: string) {
        const item = await prisma.item.findFirst({
            where: { id: itemId, userId }
        })

        if (!item) {
            throw new AppError('Item not found', 404)
        }

        return prisma.item.update({
            where: { id: itemId },
            data: {
                lastReviewedAt: new Date(),
                reviewCount: { increment: 1 }
            }
        })
    }

    /**
     * Gets a few random or highly-relevant items for the "Daily Knowledge" dashboard widget.
     * Prioritizes items that have been least reviewed.
     */
    static async getResurfacedItems(userId: string, count: number = 2) {
        // Fetch all processed items
        const items = await prisma.item.findMany({
            where: { userId, status: 'processed' },
            include: { tags: { include: { tag: true } } },
            orderBy: [{ reviewCount: 'asc' }, { createdAt: 'asc' }],
            take: count * 3 // Pull a pool
        });

        // Shuffle the pool to give a fresh "Daily" feel
        const shuffled = items.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
