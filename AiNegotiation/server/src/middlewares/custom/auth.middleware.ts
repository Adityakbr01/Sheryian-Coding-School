import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../features/auth/auth.service.ts';
import { logger } from '../../services/loggerService.ts';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        const token: string | undefined = req.cookies?.token;
        if (!token) {
            logger.warn('Unauthorized request — no token cookie', { path: req.path, ip: req.ip });
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }

        const payload = authService.verifyToken(token);
        (req as any).user = payload;
        next();
    } catch {
        logger.warn('Unauthorized request — invalid/expired token', { path: req.path, ip: req.ip });
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    try {
        const token: string | undefined = req.cookies?.token;
        if (token) {
            const payload = authService.verifyToken(token);
            (req as any).user = payload;
        }
    } catch {
        // Silently fail — optional auth
    }
    next();
}

