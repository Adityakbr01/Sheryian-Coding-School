import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/utils/apiResponse';

// --- Error Type Guards & Converters ---

const handleZodError = (err: ZodError) => {
    const errors = err.errors.map((el) => `${el.path.join('.')}: ${el.message}`);
    const message = `Validation Error: ${errors.join(', ')}`;
    return new AppError(message, 400);
};

const handleMongooseCastError = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleMongooseDuplicateKeyError = (err: any) => {
    const message = `Duplicate field value: ${JSON.stringify(err.keyValue)}. Please use another value!`;
    return new AppError(message, 409);
};

const handleMongooseValidationError = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid Input Data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// --- Main Handler ---

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err; // Keep original reference first
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // Clone for modification if needed, but preserve prototype if standard Error
    // For specific library errors, we check instanceof or name/code properties

    // 1. Zod Validation Error
    if (err instanceof ZodError) error = handleZodError(err);

    // 2. Mongoose Errors (By Name/Code)
    if (err.name === 'CastError') error = handleMongooseCastError(err);
    if (err.code === 11000) error = handleMongooseDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleMongooseValidationError(err);

    // 3. JsonWebToken Errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // 4. Body Parser Errors
    if (err.type === 'entity.parse.failed') error = new AppError('Invalid JSON in request body', 400);

    const message = error.message || 'Something went wrong';
    const statusCode = error.statusCode || 500;

    // Log appropriate level
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} - Server Error: ${message}`, {
            stack: err.stack
        });
    } else {
        logger.warn(`[${req.method}] ${req.originalUrl} - ${message}`);
    }

    // Send Response
    // In Production: Don't leak stack traces
    if (process.env.NODE_ENV === 'production') {
        // Operational, trusted error: send message to client
        if (error.isOperational) {
            return ApiResponse.error(res, message, statusCode);
        }
        // Programming or other unknown error: don't leak details
        return ApiResponse.error(res, 'Something went wrong!', 500);
    }

    // In Development: Show everything
    return ApiResponse.error(res, message, statusCode, err.stack);
};

export const configureErrorHandling = (app: any) => {
    // 404 Handler - Must be registered after all routes
    app.use(notFoundHandler);

    // Global Error Handler
    app.use(globalErrorHandler);
};
