import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { Product } from '../models/Product.ts';
import { PRODUCTS } from '../utils/products.ts';
import { env } from './env.ts';
import { logger } from '../services/loggerService.ts';

export async function seedDatabase(): Promise<void> {
    await seedAdminUser();
    await seedProducts();
}

async function seedAdminUser(): Promise<void> {
    try {
        // Always produce a fresh single-hash so we fix any previous double-hash in DB.
        // updateOne bypasses the pre('save') hook, so we hash manually here — exactly once.
        const passwordHash = await bcrypt.hash(env.adminPassword, 12);

        const existing = await User.findOne({ email: env.adminEmail });
        if (existing) {
            // Refresh password hash + ensure role=admin on every startup
            await User.updateOne(
                { email: env.adminEmail },
                { $set: { role: 'admin', passwordHash } },
            );
            logger.info('👑 Admin credentials refreshed', { email: env.adminEmail });
            return;
        }

        // New admin — use updateOne with upsert so the pre-save hook is NOT involved
        // and the already-hashed password is stored as-is.
        await User.collection.insertOne({
            name: env.adminName,
            email: env.adminEmail.toLowerCase(),
            passwordHash,
            role: 'admin',
            score: 0,
            totalSessions: 0,
            bestDealPrice: Infinity,
            wins: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        logger.info(`👑 Admin user seeded`, { email: env.adminEmail });
    } catch (err: any) {
        logger.error('Admin seed failed', { message: err.message, stack: err.stack });
    }
}

async function seedProducts(): Promise<void> {
    try {
        // Upsert all products so price/description changes always propagate to DB
        for (const p of PRODUCTS) {
            await Product.updateOne(
                { id: p.id },
                {
                    $set: {
                        name: p.name,
                        description: p.description,
                        basePrice: p.basePrice,
                        minimumPrice: p.minimumPrice,
                        emoji: p.emoji,
                        isActive: true,
                    },
                },
                { upsert: true },
            );
        }
        logger.info(`🛍️  Synced ${PRODUCTS.length} products (upsert)`);
    } catch (err: any) {
        logger.error('Product seed failed', { message: err.message, stack: err.stack });
    }
}

