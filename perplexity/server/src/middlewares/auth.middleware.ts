import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '@/configs/ENV';
import { AppError } from '@/utils/AppError';

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
        }
    }
}

export type AuthRequest = Request & { user: Express.User };

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Not authorized to access this route', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError('Not authorized, no token', 401);
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };

        // Attach user to request object
        req.user = decoded;
        next();
    } catch (error) {
        next(new AppError('Not authorized, token failed', 401));
    }
};
