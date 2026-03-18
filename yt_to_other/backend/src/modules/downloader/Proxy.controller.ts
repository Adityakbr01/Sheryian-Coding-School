// Add this to your downloader.controller.ts or a separate proxy.controller.ts
// Route: GET /api/proxy?url=<encoded_url>&filename=<encoded_filename>

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const proxyDownload = async (req: Request, res: Response, next: NextFunction) => {
    const { url, filename } = req.query as { url?: string; filename?: string };

    if (!url) {
        return res.status(400).json({ message: 'url query param is required' });
    }

    // Only allow proxying to trusted hosts (Google CDN, YouTube, etc.)
    const ALLOWED_HOSTS = [
        'googlevideo.com',
        'ytimg.com',
        'youtube.com',
        'googleapis.com',
    ];

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).json({ message: 'Invalid URL' });
    }

    const isAllowed = ALLOWED_HOSTS.some((host) => parsedUrl.hostname.endsWith(host));
    if (!isAllowed) {
        return res.status(403).json({ message: 'Host not allowed for proxying' });
    }

    try {
        logger.info(`[Proxy] Fetching: ${parsedUrl.hostname}${parsedUrl.pathname}`);

        const upstream = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.youtube.com/',
            },
            signal: AbortSignal.timeout(30_000),
        });

        if (!upstream.ok) {
            return res.status(upstream.status).json({ message: `Upstream returned ${upstream.status}` });
        }

        const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
        const contentLength = upstream.headers.get('content-length');
        const safeFilename = (filename ?? 'download').replace(/[^a-zA-Z0-9._-]/g, '_');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        if (contentLength) res.setHeader('Content-Length', contentLength);
        res.setHeader('Cache-Control', 'no-cache');

        // Stream the response body directly to the client
        if (!upstream.body) {
            return res.status(502).json({ message: 'No response body from upstream' });
        }

        const reader = upstream.body.getReader();
        const pump = async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) { res.end(); break; }
                const canContinue = res.write(value);
                if (!canContinue) {
                    await new Promise((resolve) => res.once('drain', resolve));
                }
            }
        };

        await pump();
    } catch (err: any) {
        logger.error(`[Proxy] Failed: ${err.message}`);
        if (!res.headersSent) next(err);
    }
};