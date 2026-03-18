import { createWorker } from './downloader.queue';

// This file is the entry point for the worker process
console.log('Starting Downloader Worker...');

const worker = createWorker();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing worker');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing worker');
    await worker.close();
    process.exit(0);
});
