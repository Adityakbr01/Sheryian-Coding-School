import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import prisma from '../config/db'
import { AppError } from '../utils/AppError'
import { catchAsync } from '../utils/catchAsync'

export interface AuthRequest extends Request {
  user?: {
    userId: string
  }
}

/**
 * Middleware to verify stateless JWT tokens and attach the decoded user payload
 * to the request object. Throws standardized AppErrors for all unauthorized cases.
 */
export const authMiddleware = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized: No token provided', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }

    // Optionally --> verify user existence in DB to ensure the user wasn't deleted
    // This maintains "stateless" session behavior but adds a safety check.
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    })

    if (!userExists) {
      throw new AppError('Unauthorized: User no longer exists. Please register again.', 401)
    }

    req.user = decoded
    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Unauthorized: Token expired. Please login again.', 401)
    }
    throw new AppError('Unauthorized: Invalid token', 401)
  }
})

