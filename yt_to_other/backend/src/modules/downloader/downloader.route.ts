import { Router } from 'express';
import { startDownload, getStatus, cancelDownload, serveFile, serveProxy } from './downloader.controller';

const router = Router();

router.post('/download', startDownload);   // POST   /api/download
router.get('/status/:jobId', getStatus);       // GET    /api/status/:jobId
router.delete('/cancel/:jobId', cancelDownload);  // DELETE /api/cancel/:jobId
router.get('/files/:filename', serveFile);       // GET    /api/files/:filename
router.get('/proxy', serveProxy);                // GET    /api/proxy

export default router;