import type { Request, Response } from 'express';
import { Product } from '../../models/Product.ts';
import { User } from '../../models/User.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { AppError } from '../../utils/AppError.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import { cacheGet, cacheSet, cacheDel } from '../../configs/redis.ts';
import zod from 'zod';

const baseProductFields = {
    name: zod.string().min(1),
    description: zod.string().min(1),
    basePrice: zod.number().positive(),
    minimumPrice: zod.number().positive(),
    emoji: zod.string().default('🛍️'),
    isActive: zod.boolean().default(true),
    isAActive: zod.boolean().optional(),
};

const baseProductSchema = zod.object({
    id: zod.string().min(1).regex(/^[a-z0-9_-]+$/, 'id must be lowercase slug with hyphens or underscores'),
    ...baseProductFields,
});

const transformTypo = (data: any) => {
    // Sync the common typo 'isAActive' to 'isActive' if provided
    if (data.isAActive !== undefined && (data.isActive === undefined || data.isActive === true)) {
        data.isActive = data.isAActive;
    }
    return data;
};

const productSchema = baseProductSchema.transform(transformTypo);

const updateProductSchema = zod.object(baseProductFields).partial().transform(transformTypo);

export const adminController = {
    // ── Products ───────────────────────────────────────────────────────────
    listProducts: asyncCatch(async (_req: Request, res: Response) => {
        const CACHE_KEY = 'products:all';
        const cached = await cacheGet(CACHE_KEY);
        if (cached) return sendResponse({ res, data: cached });

        const products = await Product.find({}).sort({ createdAt: -1 });
        await cacheSet(CACHE_KEY, products, 120);
        sendResponse({ res, data: products });
    }),

    createProduct: asyncCatch(async (req: Request, res: Response) => {
        const data = productSchema.parse(req.body);
        const existing = await Product.findOne({ id: data.id });
        if (existing) throw new AppError('Product id already exists', 409);
        const product = await Product.create(data);
        await cacheDel('products:*', 'analytics:summary');
        sendResponse({ res, statusCode: 201, data: product });
    }),

    updateProduct: asyncCatch(async (req: Request, res: Response) => {
        const { productId } = req.params;
        const data = updateProductSchema.parse(req.body);
        const product = await Product.findOneAndUpdate(
            { id: productId },
            { $set: data },
            { returnDocument: 'after' },
        );
        if (!product) throw new AppError('Product not found', 404);
        await cacheDel('products:*', 'analytics:summary');
        sendResponse({ res, data: product });
    }),

    deleteProduct: asyncCatch(async (req: Request, res: Response) => {
        const { productId } = req.params;
        // Soft-delete: set isActive = false
        const product = await Product.findOneAndUpdate(
            { id: productId },
            { $set: { isActive: false } },
            { returnDocument: 'after' },
        );
        if (!product) throw new AppError('Product not found', 404);
        await cacheDel('products:*', 'analytics:summary');
        sendResponse({ res, message: 'Product deactivated', data: product });
    }),

    // ── Users ──────────────────────────────────────────────────────────────
    listUsers: asyncCatch(async (_req: Request, res: Response) => {
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .select('name email role score totalSessions wins createdAt');
        sendResponse({ res, data: users });
    }),

    promoteUser: asyncCatch(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { role } = zod.object({ role: zod.enum(['user', 'admin']) }).parse(req.body);
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { role } },
            { returnDocument: 'after' },
        ).select('name email role');
        if (!user) throw new AppError('User not found', 404);
        sendResponse({ res, data: user });
    }),
};

