import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import prisma from '../config/db'

export interface AuthRequest extends Request {
  user?: { userId: string }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }

    // Verify the user actually exists in the database
    // (handles cases where DB was reset but frontend still holds an old token)
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    })

    if (!userExists) {
      return res
        .status(401)
        .json({
          error: 'Unauthorized: User no longer exists. Please register again.',
        })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}
