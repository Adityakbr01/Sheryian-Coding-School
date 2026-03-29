import mongoose from 'mongoose';
import { env } from './env.ts';
import { logger } from '../services/loggerService.ts';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info('✅ MongoDB connected successfully');
    } catch (error: any) {
        logger.error('❌ MongoDB connection failed', { message: error.message, stack: error.stack });
        process.exit(1);
    }
}
