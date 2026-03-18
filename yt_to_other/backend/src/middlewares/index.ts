import { Express } from 'express';
import { logger } from '@/utils/logger';

// System Middlewares
import { configureSecurity } from './system/security';
import { configureParsers } from './system/parser';
import { configureLogging } from './system/logs';
import { configureErrorHandling } from './system/errors';

export const registerSystemMiddlewares = (app: Express) => {
    logger.info('Registering system middlewares...');

    // 1. Logging (First so we catch early requests)
    configureLogging(app);

    // 2. Security (Helmet, CORS, Rate Limit)
    configureSecurity(app);

    // 3. Parsers (Body, Cookie, Compression)
    configureParsers(app);

    logger.info('System middlewares registered successfully');
};

export const registerErrorHandlers = (app: Express) => {
    logger.info('Registering error handlers...');
    configureErrorHandling(app);
};
