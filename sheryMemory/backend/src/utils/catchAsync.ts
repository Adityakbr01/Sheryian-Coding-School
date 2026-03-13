import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async route handler so that any unhandled Promise rejections
 * are automatically caught and passed to the next() error handler.
 */
export const catchAsync = (fn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
