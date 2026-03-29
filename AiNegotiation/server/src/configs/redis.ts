import Redis from 'ioredis';
import { env } from './env.ts';
import { logger } from '../services/loggerService.ts';

export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    retryStrategy: (times) => {
        if (times > 5) {
            logger.error('Redis: max retries reached — giving up');
            return null; // stop retrying
        }
        return Math.min(times * 200, 2000);
    },
});

redis.on('connect', () => logger.info('🔴 Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { message: err.message }));

// ── Cache helpers ────────────────────────────────────────────────────────────

const DEFAULT_TTL = 60; // seconds

/**
 * Try to read from cache. Returns parsed JSON or null on miss.
 */
export const cacheGet = async <T = unknown>(key: string): Promise<T | null> => {
    const raw = await redis.get(key);
    if (raw) {
        logger.debug('Cache HIT', { key });
        return JSON.parse(raw) as T;
    }
    logger.debug('Cache MISS', { key });
    return null;
};

/**
 * Write to cache with an optional TTL (default 60 s).
 */
export const cacheSet = async (key: string, data: unknown, ttl = DEFAULT_TTL): Promise<void> => {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
};

/**
 * Delete one or more keys (exact or glob pattern via SCAN).
 */
export const cacheDel = async (...keys: string[]): Promise<void> => {
    for (const key of keys) {
        if (key.includes('*')) {
            // Pattern delete using SCAN (safe for production)
            let cursor = '0';
            do {
                const [nextCursor, matchedKeys] = await redis.scan(cursor, 'MATCH', key, 'COUNT', 100);
                cursor = nextCursor;
                if (matchedKeys.length > 0) {
                    await redis.del(...matchedKeys);
                    logger.debug('Cache invalidated (pattern)', { pattern: key, count: matchedKeys.length });
                }
            } while (cursor !== '0');
        } else {
            await redis.del(key);
            logger.debug('Cache invalidated', { key });
        }
    }
};

