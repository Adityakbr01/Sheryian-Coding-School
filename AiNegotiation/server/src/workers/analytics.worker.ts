import { Worker, type Job } from 'bullmq';
import { redis } from '../configs/redis.ts';
import { cacheDel } from '../configs/redis.ts';
import { learningService } from '../services/learningService.ts';
import { logger } from '../services/loggerService.ts';

export type AnalyticsJobName = 'run-analytics' | 'recalc-leaderboard';

const processor = async (job: Job) => {
    const start = Date.now();

    switch (job.name as AnalyticsJobName) {
        case 'run-analytics': {
            logger.info('Worker: starting run-analytics job', { jobId: job.id });
            await learningService.runAnalyticsJob();
            // Invalidate any cached analytics data
            await cacheDel('analytics:summary');
            break;
        }

        case 'recalc-leaderboard': {
            logger.info('Worker: starting recalc-leaderboard job', { jobId: job.id });
            // Invalidate cached leaderboard so next request fetches fresh data
            await cacheDel('leaderboard:global');
            break;
        }

        default:
            logger.warn('Worker: unknown job name', { name: job.name });
    }

    const elapsed = Date.now() - start;
    logger.info('Worker: job completed', { jobId: job.id, name: job.name, durationMs: elapsed });
};

export const analyticsWorker = new Worker('analytics', processor, {
    connection: redis,
    concurrency: 2,
});

analyticsWorker.on('failed', (job, err) => {
    logger.error('Worker: job failed', { jobId: job?.id, name: job?.name, error: err.message });
});

analyticsWorker.on('completed', (job) => {
    logger.info('Worker: job completed event', { jobId: job.id, name: job.name });
});

