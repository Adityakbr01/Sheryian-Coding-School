import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import env from 'configs/ENV';
import logger from '../utils/logger';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (env.NODE_ENV === 'development') {
        logger.error(`[Global Error Handler] - ${err.message}`, { stack: err.stack });
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    } else {
        // Production Mode
        if (err.isOperational) {
            // Known operational error
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message,
            });
        } else {
            // Programming or unknown error (Don't leak details)
            logger.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};
