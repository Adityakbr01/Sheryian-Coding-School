import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express route handler so that any rejected promise
 * is automatically forwarded to Express's `next(err)` — eliminating
 * the need for repetitive try/catch blocks in every controller method.
 *
 * Usage:
 *   router.get('/path', asyncCatch(async (req, res) => { ... }));
 */
export const asyncCatch = (fn: AsyncRouteHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

