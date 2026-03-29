/**
 * Operational error with an HTTP status code.
 * Thrown deliberately by service/controller code for expected failure paths
 * (bad input, not found, unauthorised, etc.).
 *
 * Unexpected programming errors (bugs, DB connection drops…) are NOT AppErrors
 * and will reach the global error handler as plain Error instances.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational = true;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        // Preserve correct stack trace in V8 environments
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

