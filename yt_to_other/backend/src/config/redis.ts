import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { ENV } from './ENV';

const getRedisConfig = (): RedisOptions => {
    if (ENV.UPSTASH_REDIS_URL) {
        try {
            const url = new URL(ENV.UPSTASH_REDIS_URL);
            return {
                host: url.hostname,
                port: Number(url.port),
                username: url.username,
                password: url.password,
                tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
                maxRetriesPerRequest: null,
            };
        } catch (e) {
            console.error("Invalid Redis URL:", e);
        }
    }

    return {
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: null,
    };
};

const redisConfig = getRedisConfig();

// Singleton connection for general purpose use if needed
const redisConnection = new Redis(redisConfig);

redisConnection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
    console.log('Redis connected successfully');
});

export { redisConfig, redisConnection };
