import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    url: process.env.UPSTASH_REDIS_URL,
    maxRetriesPerRequest: null, // Required specifically for BullMQ
};

// Singleton connection for general purpose use if needed
const redisConnection = new Redis(redisConfig);

redisConnection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
    console.log('Redis connected successfully');
});

export { redisConfig, redisConnection };
