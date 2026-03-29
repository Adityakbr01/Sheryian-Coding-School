import type { Request, Response, NextFunction } from 'express';

/**
 * Requires the user to be authenticated AND have role === 'admin'.
 * Must be used AFTER the `authenticate` middleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;
    if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    if (user.role.toLowerCase() !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
        return;
    }
    next();
}

