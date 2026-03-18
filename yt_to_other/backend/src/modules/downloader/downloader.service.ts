import { downloadQueue } from './downloader.queue';
import { DownloadRequestInput } from './downloader.validator';
import { IJobData, JobState, IJobStatusResponse, DownloadServer } from './downloader.types';
import { processThirdParty } from './providers/api.provider';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@/utils/appError';
import { EventEmitter } from 'events';
import { logger } from '@/utils/logger';

// ── Fast-path (FASTER server) in-memory store ───────────────────────────────

export const fastJobsEmitter = new EventEmitter();
fastJobsEmitter.setMaxListeners(200); // Support many concurrent SSE listeners

interface IFastJobEntry {
    status: IJobStatusResponse;
    expiresAt: number; // Unix ms — evict after this
}

const FAST_JOB_TTL_MS = 15 * 60 * 1000; // 15 min
const fastJobsStore = new Map<string, IFastJobEntry>();

/** Evict expired entries — runs every 5 minutes */
setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of fastJobsStore) {
        if (now > entry.expiresAt) {
            fastJobsStore.delete(id);
            logger.debug(`[Service] Evicted expired fast job ${id}`);
        }
    }
}, 5 * 60 * 1000).unref();

// ── Public API ──────────────────────────────────────────────────────────────

export const addToQueue = async (
    data: DownloadRequestInput,
): Promise<{ jobId: string }> => {
    const jobId = uuidv4();

    if (data.server === DownloadServer.FASTER) {
        return startFastJob(jobId, data);
    }

    // SECURE path → BullMQ
    const jobData: IJobData = { ...data, jobId, timestamp: Date.now() };

    await downloadQueue.add('download-job', jobData, {
        jobId,
        priority: 2,
    });

    logger.info(`[Service] Queued SECURE job ${jobId}`);
    return { jobId };
};

export const getJobStatus = async (jobId: string): Promise<IJobStatusResponse> => {
    const fastEntry = fastJobsStore.get(jobId);
    if (fastEntry) return fastEntry.status;

    const job = await downloadQueue.getJob(jobId);
    if (!job) throw new AppError('Job not found or expired', 404);

    const state = await job.getState();
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    return {
        jobId,
        state: state as JobState,
        progress,
        result: job.returnvalue ?? undefined,
        error: job.failedReason ?? undefined,
    };
};

export const cancelJob = async (jobId: string): Promise<void> => {
    const fastEntry = fastJobsStore.get(jobId);
    if (fastEntry) {
        fastEntry.status.state = JobState.FAILED;
        fastEntry.status.error = 'Cancelled by user';
        fastJobsEmitter.emit('failed', { jobId });
        fastJobsStore.delete(jobId);
        logger.info(`[Service] Cancelled fast job ${jobId}`);
        return;
    }

    const job = await downloadQueue.getJob(jobId);
    if (!job) throw new AppError('Job not found or already removed', 404);

    const state = await job.getState();
    if (state === 'active') {
        // Can't remove an active BullMQ job — mark for manual follow-up
        throw new AppError('Cannot cancel a job that is actively processing', 409);
    }

    try {
        await job.remove();
        logger.info(`[Service] Cancelled queued job ${jobId}`);
    } catch (err: any) {
        throw new AppError(`Failed to cancel job: ${err.message}`, 400);
    }
};

// ── Fast-path implementation ────────────────────────────────────────────────

function startFastJob(jobId: string, data: DownloadRequestInput): { jobId: string } {
    const status: IJobStatusResponse = {
        jobId,
        state: JobState.ACTIVE,
        progress: 0,
        result: undefined,
        error: undefined,
    };

    fastJobsStore.set(jobId, {
        status,
        expiresAt: Date.now() + FAST_JOB_TTL_MS,
    });

    const updateProgress = (progress: number) => {
        status.progress = progress;
        // Match the event shape queueEvents uses: emit('progress', { jobId })
        // server.ts bridges these to Socket.IO via emitStatus(jobId)
        fastJobsEmitter.emit('progress', { jobId });
    };

    const jobData: IJobData = { ...data, jobId, timestamp: Date.now() };

    processThirdParty(jobData, updateProgress)
        .then((result) => {
            status.state = JobState.COMPLETED;
            status.progress = 100;
            status.result = result;
            // Extend TTL so the client has time to read the result URL
            const entry = fastJobsStore.get(jobId);
            if (entry) entry.expiresAt = Date.now() + FAST_JOB_TTL_MS;
            fastJobsEmitter.emit('completed', { jobId });
            logger.info(`[Service] Fast job ${jobId} completed`);
        })
        .catch((err: Error) => {
            status.state = JobState.FAILED;
            status.error = err.message ?? 'Unknown error';
            fastJobsEmitter.emit('failed', { jobId });
            logger.error(`[Service] Fast job ${jobId} failed: ${err.message}`);
        });

    logger.info(`[Service] Started FASTER job ${jobId}`);
    return { jobId };
}