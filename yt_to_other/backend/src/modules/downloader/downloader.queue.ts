import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisConfig } from '@/config/redis';
import { IJobData, IJobResult } from './downloader.types';
import { processYtDlp } from './providers/ytdlp.provider';
import { processThirdParty } from './providers/api.provider';
import { logger } from '@/utils/logger';
import { auditLog } from '@/utils/auditLogger';

const QUEUE_NAME = 'video-download-queue';


export const downloadQueue = new Queue<IJobData, IJobResult>(QUEUE_NAME, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600,
        },
    },
});

export const queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConfig });

export const createWorker = () => {
    const worker = new Worker<IJobData, IJobResult>(QUEUE_NAME, async (job) => {
        logger.info(`[Worker] Started job ${job.id} (${job.data.server})`, { jobId: job.id, url: job.data.url });

        auditLog('DOWNLOAD_PROCESSING_START', { jobId: job.id, url: job.data.url, server: job.data.server });

        const updateProgress = async (progress: number) => {
            await job.updateProgress(progress);
        };

        if (job.data.server === 'SECURE') {
            return await processYtDlp(job.data, updateProgress);
        } else {
            return await processThirdParty(job.data, updateProgress);
        }

    }, {
        connection: redisConfig,
        concurrency: 5,
        limiter: {
            max: 10,
            duration: 1000,
        }
    });

    worker.on('completed', (job: any, result: any) => {
        logger.info(`[Worker] Job ${job.id} completed!`, { jobId: job.id });
        auditLog('DOWNLOAD_COMPLETED', { jobId: job.id, url: job.data.url, result }, 'SUCCESS');
    });

    worker.on('failed', (job: any | undefined, err: Error) => {
        const jobId = job ? job.id : 'unknown';
        logger.error(`[Worker] Job ${jobId} failed with ${err.message}`, { jobId, error: err.message });
        auditLog('DOWNLOAD_FAILED', { jobId, error: err.message }, 'FAILURE');
    });

    return worker;
};
