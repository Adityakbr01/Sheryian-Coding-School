import app from './app';
import { logger } from './utils/logger';
import { Server } from 'socket.io';
import { queueEvents } from './modules/downloader/downloader.queue';
import { fastJobsEmitter, getJobStatus } from './modules/downloader/downloader.service';
import http from 'http';
import { ENV } from './config/ENV';

const PORT = ENV.PORT;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

import { createWorker } from './modules/downloader/downloader.queue';

logger.info("Starting Worker Process...");

// Initialize the worker
const worker = createWorker();

logger.info("Worker is listening for jobs...");

// Keep process alive
process.on('SIGTERM', async () => {
    logger.info('Worker shutting down...');
    await worker.close();
});


server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
});

io.on('connection', (socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    socket.on('subscribe', async (jobId: string) => {
        logger.info(`[Socket] Client ${socket.id} joined room: ${jobId}`);
        socket.join(jobId);
        // Dispatch initial status immediately
        try {
            const status = await getJobStatus(jobId);
            logger.info(`[Socket] Dispatching initial status to ${socket.id}:`, status);
            socket.emit('status', status);
        } catch (err: any) {
            logger.error(`[Socket] Failed to fetch initial status for ${jobId}: ${err.message}`);
            socket.emit('status', { error: 'Job not found', jobId });
        }
    });

    socket.on('unsubscribe', (jobId: string) => {
        logger.info(`[Socket] Client ${socket.id} left room: ${jobId}`);
        socket.leave(jobId);
    });

    socket.on('disconnect', (reason) => {
        logger.info(`[Socket] Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
});

const emitStatus = async (jobId: string) => {
    try {
        const status = await getJobStatus(jobId);
        logger.info(`[Socket] Broadcasting updated status to room ${jobId}. Status: ${status.state}, Progress: ${status.progress}`);
        io.to(jobId).emit('status', status);
    } catch (err: any) {
        logger.error(`[Socket] Failed to broadcast status for ${jobId}: ${err.message}`);
    }
};

queueEvents.on('progress', ({ jobId }) => emitStatus(jobId));
queueEvents.on('completed', ({ jobId }) => emitStatus(jobId));
queueEvents.on('failed', ({ jobId }) => emitStatus(jobId));

fastJobsEmitter.on('progress', ({ jobId }) => emitStatus(jobId));
fastJobsEmitter.on('completed', ({ jobId }) => emitStatus(jobId));
fastJobsEmitter.on('failed', ({ jobId }) => emitStatus(jobId));

process.on('unhandledRejection', (err: any) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error: err.message, stack: err.stack });
    server.close(() => {
        process.exit(1);
    });
});
