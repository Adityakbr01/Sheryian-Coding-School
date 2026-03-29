import { Queue } from 'bullmq';
import { redis } from '../configs/redis.ts';

/**
 * Analytics queue — handles heavy aggregation jobs that should not block
 * the Express request/response cycle.
 *
 * Job types:
 *   • `run-analytics`  — full tactic recomputation (learningService.runAnalyticsJob)
 *   • `recalc-leaderboard` — invalidate leaderboard cache after score changes
 */
export const analyticsQueue = new Queue('analytics', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 50 },  // keep last 50 completed
        removeOnFail: { count: 100 },     // keep last 100 failed
    },
});

