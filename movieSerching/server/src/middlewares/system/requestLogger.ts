import { Request, Response, NextFunction } from "express";
import logger from "@/utils/logger";

/**
 * HTTP request logger middleware.
 * Logs method, URL, status code, and response time for every request.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Log when the response finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;

        const meta = {
            method,
            url: originalUrl,
            status: statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.socket.remoteAddress,
        };

        if (statusCode >= 500) {
            logger.error(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, meta);
        } else if (statusCode >= 400) {
            logger.warn(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, meta);
        } else {
            logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, meta);
        }
    });

    next();
};
