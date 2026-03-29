import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { env } from '../config/env'
import { logger } from '../utils/logger'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let issues: any = undefined
  let isOperational = err.isOperational || false

  // Handle Zod validation errors globally
  if (err instanceof ZodError) {
    statusCode = 400
    message = 'Validation failed'
    issues = err.flatten().fieldErrors
    isOperational = true
  }
  // Handle Prisma specific database errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    isOperational = true
    if (err.code === 'P2002') {
      statusCode = 409
      message = 'Duplicate field value entered (Unique constraint failed)'
    } else if (err.code === 'P2025') {
      statusCode = 404
      message = 'Record not found'
    } else {
      statusCode = 400
      message = 'Database request error'
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Invalid data sent to database'
    isOperational = true
  }

  // PRODUCTION LOGGING VS DEVELOPMENT LOGGING
  if (isOperational) {
    // In development, log the full error details even for operational errors
    if (env.NODE_ENV === 'development') {
      logger.warn(
        `${req.method} ${req.originalUrl} - ${statusCode} - ${message}`,
      )
      logger.warn(`[Stack] ${err.stack || err}`)
    } else {
      logger.warn(
        `${req.method} ${req.originalUrl} - ${statusCode} - ${message}`,
      )
    }
  } else {
    // Unexpected errors (500s, bugs, typos) - always log the full stack trace
    logger.error(
      `${req.method} ${req.originalUrl} - ${statusCode} - ${message}`,
      err,
    )
  }

  // Hide internal error details in production
  if (env.NODE_ENV === 'production' && !isOperational) {
    message = 'Internal Server Error'
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    data: null,
    message,
    issues,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
