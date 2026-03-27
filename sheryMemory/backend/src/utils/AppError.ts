/**
 * Custom Error class designed to identify "Expected" (operational) errors
 * vs Unhandled bugs.
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    // Capture the stack trace but exclude the constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}
