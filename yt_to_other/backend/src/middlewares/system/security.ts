import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import { logger } from '@/utils/logger';

export const configureSecurity = (app: Express) => {
    // 1. Security Headers
    app.use(helmet({
        crossOriginResourcePolicy: false, // For serving static files
    }));

    // 2. CORS Configuration
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }));

    // 3. Parameter Pollution Protection
    app.use(hpp());

    // 4. Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            status: 'error',
            message: 'Too many requests from this IP, please try again later.'
        },
        handler: (req, res, next, options) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(options.statusCode).json(options.message);
        }
    });

    // Apply rate limiting to all api requests
    app.use('/api', limiter);
};
