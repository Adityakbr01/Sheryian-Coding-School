import type { Request, Response } from 'express';
import { Negotiation } from '../../models/Negotiation.ts';
import { Product } from '../../models/Product.ts';
import { pricingService } from '../../services/pricingService.ts';
import type { Difficulty } from '../../models/Negotiation.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { AppError } from '../../utils/AppError.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import zod from 'zod';

const startSchema = zod.object({
    productId: zod.string().min(1),
    difficulty: zod.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const sessionController = {
    startSession: asyncCatch(async (req: Request, res: Response) => {
        const { productId, difficulty } = startSchema.parse(req.body);
        const userId = (req as any).user?.id;
        if (!userId) throw new AppError('Unauthorized', 401);

        const product = await Product.findOne({ id: productId, isActive: true });
        if (!product) throw new AppError('Product not found', 404);

        const startingPrice = pricingService.getStartingPrice(product.basePrice, difficulty as Difficulty);

        const session = await Negotiation.create({
            userId,
            productId: product.id,
            productName: product.name,
            basePrice: product.basePrice,
            minimumPrice: product.minimumPrice,
            currentPrice: startingPrice,
            difficulty,
            currentMood: 'neutral',
            moodHistory: ['neutral'],
            messages: [],
            tacticsUsed: [],
        });

        sendResponse({
            res,
            statusCode: 201,
            data: {
                sessionId: String(session._id),
                productName: product.name,
                productEmoji: product.emoji,
                basePrice: product.basePrice,
                currentPrice: startingPrice,
                minimumPrice: product.minimumPrice,
                difficulty,
                maxRounds: session.maxRounds,
                mood: 'neutral',
            },
        });
    }),

    getSession: asyncCatch(async (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const userId = (req as any).user?.id;

        const session = await Negotiation.findOne({ _id: sessionId, userId });
        if (!session) throw new AppError('Session not found', 404);

        sendResponse({
            res,
            data: {
                sessionId: String(session._id),
                productName: session.productName,
                basePrice: session.basePrice,
                currentPrice: session.currentPrice,
                finalPrice: session.finalPrice,
                mood: session.currentMood,
                totalRounds: session.totalRounds,
                maxRounds: session.maxRounds,
                isComplete: session.isComplete,
                success: session.success,
                isWalkaway: session.isWalkaway,
                difficulty: session.difficulty,
                messages: session.messages,
                tacticsUsed: session.tacticsUsed,
                moodHistory: session.moodHistory,
            },
        });
    }),

    listProducts: asyncCatch(async (_req: Request, res: Response) => {
        const products = await Product.find({ isActive: true }).sort({ basePrice: 1 });
        sendResponse({ res, data: products });
    }),

    getUserSessions: asyncCatch(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const sessions = await Negotiation.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('productName basePrice finalPrice success totalRounds difficulty createdAt isComplete');

        sendResponse({ res, data: sessions });
    }),
};

