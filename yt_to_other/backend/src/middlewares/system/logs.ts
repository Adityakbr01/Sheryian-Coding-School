import { NextFunction, Request, Response } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;

    // Log user-agent for basic analytics
    const userAgent = headers['user-agent'] || 'unknown';

    // Hook onto response finish to calculate duration
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

        const meta = {
            ip,
            userAgent,
            statusCode,
            duration,
        };

        if (statusCode >= 500) {
            logger.error(message, meta);
        } else if (statusCode >= 400) {
            logger.warn(message, meta);
        } else {
            logger.info(message, meta);
        }
    });

    next();
};

export const configureLogging = (app: any) => {
    app.use(requestLogger);
};
