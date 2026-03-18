import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import downloaderRoutes from '@/modules/downloader/downloader.route';
import { initCronJobs } from '@/modules/downloader/cron/cleanup.cron';
import { ApiResponse } from '@/utils/apiResponse';
import { registerSystemMiddlewares, registerErrorHandlers } from '@/middlewares/index';
import { proxyDownload } from './modules/downloader/Proxy.controller';

const app = express();

registerSystemMiddlewares(app);

app.use('/api', downloaderRoutes);
app.use('/api/proxy', proxyDownload);

app.use('/api/files', express.static(path.join(process.cwd(), 'downloads')));
app.use('/api/downloads', express.static(path.join(process.cwd(), 'downloads')));

// Initialize background tasks
initCronJobs();

app.get('/health', (req, res) => {
    return ApiResponse.success(res, 'Server is healthy', { timestamp: new Date() });
});

registerErrorHandlers(app);

export default app;
