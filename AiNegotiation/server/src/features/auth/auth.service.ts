import jwt from 'jsonwebtoken';
import { env } from '../../configs/env.ts';
import { authDao } from './auth.dao.ts';
import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/AppError.ts';

export interface AuthPayload {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
}

function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export const authService = {
    register: async (name: string, email: string, password: string) => {
        const existing = await authDao.findByEmail(email);
        if (existing) throw new AppError('Email already registered', 409);

        const user = await authDao.create({ name, email, password });
        const token = signToken({ id: String(user._id), email: user.email, name: user.name, role: user.role });
        return { user: { id: String(user._id), email: user.email, name: user.name, role: user.role }, token };
    },

    login: async (email: string, password: string) => {
        const user = await authDao.findByEmail(email);
        if (!user) throw new AppError('Invalid credentials', 401);

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new AppError('Invalid credentials', 401);

        const token = signToken({ id: String(user._id), email: user.email, name: user.name, role: user.role });
        return { user: { id: String(user._id), email: user.email, name: user.name, role: user.role }, token };
    },

    getMe: async (userId: string) => {
        const user = await authDao.findById(userId);
        if (!user) throw new AppError('User not found', 404);
        return { id: String(user._id), email: user.email, name: user.name, role: user.role, score: user.score, totalSessions: user.totalSessions, wins: user.wins, bestDealPrice: user.bestDealPrice };
    },

    verifyToken: (token: string): AuthPayload => {
        return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    },
};
