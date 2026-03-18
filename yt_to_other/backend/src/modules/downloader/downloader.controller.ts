import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { addToQueue, getJobStatus, cancelJob } from './downloader.service';
import { catchAsync } from '@/utils/appError';
import { downloadRequestSchema } from './downloader.validator';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { auditLog } from '@/utils/auditLogger';
import { DOWNLOAD_DIR, getVideoStreamUrl } from './providers/ytdlp.provider';
import fetch from 'node-fetch'; // Ensure node-fetch is available or use native fetch in newer node

// ── POST /api/download ──────────────────────────────────────────────────────

export const startDownload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const validation = downloadRequestSchema.safeParse(req.body);

    if (!validation.success) {
        logger.warn(`Download validation failed for IP: ${req.ip}`, validation.error.errors);
        return ApiResponse.error(res, 'Validation Error', 400, validation.error.errors);
    }

    const { url, server, format } = validation.data;

    auditLog('DOWNLOAD_REQUESTED', {
        url,
        server,
        format,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    logger.info(`Starting download for URL: ${url} (${server})`);

    const result = await addToQueue(validation.data);

    logger.info(`Job added to queue with ID: ${result.jobId}`);

    return ApiResponse.success(res, 'Download job added to queue', result, 202);
});

// ── GET /api/status/:jobId ──────────────────────────────────────────────────

export const getStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;

    if (!jobId) {
        return ApiResponse.error(res, 'Job ID is required', 400);
    }

    const status = await getJobStatus(jobId);

    return ApiResponse.success(res, 'Job status retrieved successfully', status);
});

// ── DELETE /api/cancel/:jobId ───────────────────────────────────────────────

export const cancelDownload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;

    if (!jobId) {
        return ApiResponse.error(res, 'Job ID is required', 400);
    }

    await cancelJob(jobId);

    auditLog('DOWNLOAD_CANCELLED', { jobId, ip: req.ip });
    logger.info(`Job cancelled by user: ${jobId}`);

    return ApiResponse.success(res, 'Job completely cancelled', null);
});

// ── GET /api/files/:filename ────────────────────────────────────────────────
// Serves yt-dlp downloaded files directly to the browser with correct headers.

export const serveFile = (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params;

    // Guard against path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(DOWNLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        logger.warn(`[serveFile] File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found or already expired' });
    }

    const ext = path.extname(filename).toLowerCase();

    const mimeTypes: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.m4a': 'audio/mp4',
        '.webm': 'video/webm',
        '.ogg': 'audio/ogg',
    };


    const contentType = mimeTypes[ext] ?? 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('error', (err) => {
        logger.error(`Stream error for file ${filename}: ${err.message}`);
        // If headers aren't sent, we can send error, otherwise just destroy
        if (!res.headersSent) res.status(500).end();
    });
};

// ── GET /api/proxy ──────────────────────────────────────────────────────────
// Streaming Proxy: Resolves YouTube URL to a direct stream and pipes it
export const serveProxy = async (req: Request, res: Response) => {
    const url = req.query.url as string;
    // filename is optional, getVideoStreamUrl resolves a filename if needed, or we use query param
    const filenameParam = req.query.filename as string;

    if (!url) {
        return res.status(400).send('Valid URL parameter is required');
    }

    try {
        // 1. Get the direct stream URL using yt-dlp -g (IP bound to server)
        const { url: directUrl, filename: resolvedFilename, contentLength } = await getVideoStreamUrl(url);

        const finalFilename = filenameParam || resolvedFilename || 'video.mp4';

        logger.info(`[Proxy] Streaming ${url} -> ${directUrl}`);

        // 2. Fetch the stream from the direct URL
        // Note: fetch here is node-fetch (imported) which returns a Node stream body
        const response = await fetch(directUrl);
        if (!response.ok) throw new Error(`Upstream error: ${response.status}`);

        // 3. Set headers
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        // Use the content length from yt-dlp info if available, as direct stream might not have it or it might be chunked
        const length = contentLength || response.headers.get('content-length');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
        if (length) res.setHeader('Content-Length', length);

        // 4. Pipe the body
        if (response.body) {
            response.body.pipe(res);

            response.body.on('error', (err) => {
                logger.error(`[Proxy] Stream error: ${err.message}`);
                if (!res.headersSent) res.end();
            });
        } else {
            res.end();
        }

    } catch (err: any) {
        logger.error(`[Proxy] Error proxying ${url}: ${err.message}`);
        // Only send error payload if headers haven't been sent
        if (!res.headersSent) {
            // Check if it's a known error
            const status = err.statusCode || 502;
            res.status(status).send(`Proxy error: ${err.message}`);
        }
    }
};
