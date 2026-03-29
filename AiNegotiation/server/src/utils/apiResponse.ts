import type { Response } from 'express';

interface ApiResponseOptions<T> {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: T;
}

/**
 * Send a standardised success response.
 *
 * Usage:
 *   sendResponse({ res, statusCode: 201, message: 'Created', data: product });
 *   sendResponse({ res, data: leaderboard });          // defaults to 200
 */
export const sendResponse = <T = unknown>({ res, statusCode = 200, message, data }: ApiResponseOptions<T>): void => {
    const body: Record<string, unknown> = { success: true };
    if (message) body.message = message;
    if (data !== undefined) body.data = data;
    res.status(statusCode).json(body);
};