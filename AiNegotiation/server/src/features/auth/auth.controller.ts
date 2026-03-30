import type { Request, Response } from 'express';
import { authService } from './auth.service.ts';
import { logger } from '../../services/loggerService.ts';
import { env } from '../../configs/env.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { AppError } from '../../utils/AppError.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import zod from 'zod';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true, // ALWAYS true in production
    sameSite: 'none' as const, // MUST for cross-origin
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};
const registerSchema = zod.object({
    name: zod.string().min(2),
    email: zod.email(),
    password: zod.string().min(6),
});

const loginSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(1),
});

export const authController = {
    register: asyncCatch(async (req: Request, res: Response) => {
        const { name, email, password } = registerSchema.parse(req.body);
        const { user, token } = await authService.register(name, email, password);
        res.cookie('token', token, COOKIE_OPTIONS);
        logger.info('User registered', { email: user.email, userId: user.id });
        sendResponse({ res, statusCode: 201, data: { user } });
    }),

    login: asyncCatch(async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);
        const { user, token } = await authService.login(email, password);
        res.cookie('token', token, COOKIE_OPTIONS);
        logger.info('User logged in', { email: user.email, userId: user.id });
        sendResponse({ res, data: { user } });
    }),

    logout: (_req: Request, res: Response) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
            path: '/',
        });
        logger.info('User logged out');
        sendResponse({ res, message: 'Logged out successfully' });
    },

    getMe: asyncCatch(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        if (!userId) throw new AppError('Unauthorized', 401);
        const user = await authService.getMe(userId);
        sendResponse({ res, data: user });
    }),
};
