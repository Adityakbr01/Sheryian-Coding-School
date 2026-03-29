import type { Request, Response, NextFunction } from 'express';
import { logger, sanitizeBody } from '../../services/loggerService.ts';

/**
 * Determines whether the route is an SSE endpoint (negotiate, non-accept).
 * SSE connections stay open, so we track 'close' instead of 'finish'.
 */
function isSSERoute(url: string): boolean {
    return /\/api\/negotiate(?!.*\/accept)/.test(url);
}

/**
 * Pick log level based on HTTP status code.
 */
function levelFromStatus(status: number): 'error' | 'warn' | 'info' {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warn';
    return 'info';
}

/**
 * requestLogger — logs every inbound request and its eventual response.
 *
 * SSE routes:  logs stream-open on request + stream-close on `res.close`.
 * Normal routes: logs method + url on request + status + latency on `res.finish`.
 *
 * Sensitive body keys (password, token, etc.) are automatically redacted.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, url } = req;

    // Build a safe, redacted snapshot of the body for logging
    const safeBody =
        req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
            ? sanitizeBody(req.body as Record<string, unknown>)
            : undefined;

    if (isSSERoute(url)) {
        // ── SSE path ───────────────────────────────────────────────────────────
        logger.info(`📡 SSE stream opened`, { method, url, ...(safeBody && { body: safeBody }) });

        res.on('close', () => {
            const duration = Date.now() - start;
            logger.info(`📡 SSE stream closed`, { method, url, duration: `${duration}ms` });
        });
    } else {
        // ── Normal HTTP path ───────────────────────────────────────────────────
        logger.debug(`→ ${method} ${url}`, { ...(safeBody && { body: safeBody }) });

        res.on('finish', () => {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const level = levelFromStatus(status);
            logger[level](`← ${method} ${url} ${status}`, { duration: `${duration}ms` });
        });
    }

    next();
}

