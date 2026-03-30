import dns from "dns";

// 🔥 IMPORTANT: Fix MongoDB SRV DNS resolution issue (Bun bug)
dns.setDefaultResultOrder("ipv4first");


import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './configs/env.ts';
import { connectDB } from './configs/db.ts';
import { seedDatabase } from './configs/seed.ts';
import { logger } from './services/loggerService.ts';
import { requestLogger } from './middlewares/system/logger.middleware.ts';
import { AppError } from './utils/AppError.ts';
import zod from 'zod';
import { initializeSocket } from './socket.ts';

import authRouter from './features/auth/auth.route.ts';
import sessionRouter from './features/session/session.route.ts';
import negotiateRouter from './features/negotiate/negotiate.route.ts';
import leaderboardRouter from './features/leaderboard/leaderboard.route.ts';
import analyticsRouter from './features/analytics/analytics.route.ts';
import adminRouter from './features/admin/admin.route.ts';

const app = express();

// ── CORS — must be first, before helmet and rate limiter ──────────────────────
const corsOptions: cors.CorsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204, // respond 204 to preflight
};

app.use(cors(corsOptions));
// Respond 204 immediately to all preflight (OPTIONS) requests
app.options(/.*/, cors(corsOptions));

// ── Security (after CORS so headers aren't overwritten) ───────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

const negotiateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 30,
    message: { success: false, message: 'Negotiate rate limit exceeded.' },
});

app.use(generalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
// Must come before requestLogger so req.body is parsed before being logged.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Request / Response Logger (after body parsers) ────────────────────────────
app.use(requestLogger);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/negotiate', negotiateLimiter, negotiateRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Zod validation errors → 400 Bad Request
    if (err instanceof zod.ZodError) {
        const zodErr = err as zod.ZodError;
        const message = zodErr.issues.map((e) => e.message).join('; ');
        logger.warn('Validation error', { issues: zodErr.issues });
        return res.status(400).json({ success: false, message });
    }

    // Operational errors (AppError) — use the status code from the thrown error
    if (err instanceof AppError && err.isOperational) {
        logger.warn('Operational error', { statusCode: err.statusCode, message: err.message });
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    // Unknown / programming errors — log the full stack, hide details from client
    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10);

connectDB().then(async () => {
    await seedDatabase();
    const httpServer = createServer(app);
    const io = initializeSocket(httpServer, corsOptions);
    io && logger.info('🟢 Socket.IO initialized');

    httpServer.listen(PORT, () => {
        logger.info(`🚀 NegotiateAI server running on http://localhost:${PORT}`);
        logger.info(`   Environment: ${env.NODE_ENV} | LLM: ${env.LLM_PROVIDER}`);
        logger.info(`   Socket.IO server alive at http://localhost:${PORT}`);
    });
});

export default app;

