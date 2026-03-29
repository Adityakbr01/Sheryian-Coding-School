import type { Request, Response } from 'express';
import { User } from '../../models/User.ts';
import { Negotiation } from '../../models/Negotiation.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { AppError } from '../../utils/AppError.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import { cacheGet, cacheSet } from '../../configs/redis.ts';
import { io } from '../../socket.ts';

export const leaderboardController = {
    getGlobal: asyncCatch(async (_req: Request, res: Response) => {
        const CACHE_KEY = 'leaderboard:global';
        const cached = await cacheGet(CACHE_KEY);
        if (cached) {
            return sendResponse({
                res,
                data: {
                    items: cached,
                    cache: { blagCache: true, cachedBy: 'redis', source: 'leaderboard:global' },
                },
            });
        }

        const topUsers = await User.find({})
            .sort({ score: -1 })
            .limit(50)
            .select('name score wins totalSessions bestDealPrice createdAt');

        const leaderboard = topUsers.map((u, idx) => ({
            rank: idx + 1,
            userId: String(u._id),
            name: u.name,
            score: u.score,
            wins: u.wins,
            totalSessions: u.totalSessions,
            bestDealPrice: u.bestDealPrice === Infinity ? null : u.bestDealPrice,
            winRate: u.totalSessions > 0 ? Math.round((u.wins / u.totalSessions) * 100) : 0,
        }));

        await cacheSet(CACHE_KEY, leaderboard, 30);
        io?.emit('leaderboard:update', { source: 'leaderboard:getGlobal', timestamp: new Date().toISOString() });
        sendResponse({ res, data: { items: leaderboard, cache: { blagCache: false } } });
    }),

    getMyRank: asyncCatch(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        if (!userId) throw new AppError('Unauthorized', 401);

        const user = await User.findById(userId).select('name score wins totalSessions bestDealPrice');
        if (!user) throw new AppError('User not found', 404);

        const rank = await User.countDocuments({ score: { $gt: user.score } }) + 1;

        sendResponse({
            res,
            data: {
                rank,
                name: user.name,
                score: user.score,
                wins: user.wins,
                totalSessions: user.totalSessions,
                bestDealPrice: user.bestDealPrice === Infinity ? null : user.bestDealPrice,
                winRate: user.totalSessions > 0 ? Math.round((user.wins / user.totalSessions) * 100) : 0,
            },
        });
    }),

    getBestDeals: asyncCatch(async (_req: Request, res: Response) => {
        const CACHE_KEY = 'leaderboard:best-deals';
        const cached = await cacheGet(CACHE_KEY);
        if (cached) {
            return sendResponse({
                res,
                data: {
                    items: cached,
                    cache: { blagCache: true, cachedBy: 'redis', source: 'leaderboard:best-deals' },
                },
            });
        }

        const bestDeals = await Negotiation.find({ isComplete: true, success: true })
            .sort({ finalPrice: 1 })
            .limit(20)
            .populate('userId', 'name')
            .select('productName basePrice finalPrice totalRounds difficulty createdAt userId');

        const data = bestDeals.map((d, idx) => ({
            rank: idx + 1,
            productName: d.productName,
            basePrice: d.basePrice,
            finalPrice: d.finalPrice,
            discountPct: d.finalPrice
                ? Math.round(((d.basePrice - d.finalPrice) / d.basePrice) * 1000) / 10
                : 0,
            totalRounds: d.totalRounds,
            difficulty: d.difficulty,
            playerName: (d.userId as any)?.name ?? 'Anonymous',
            date: d.createdAt,
        }));

        await cacheSet(CACHE_KEY, data, 30);
        io?.emit('leaderboard:update', { source: 'leaderboard:getBestDeals', timestamp: new Date().toISOString() });
        sendResponse({ res, data: { items: data, cache: { blagCache: false } } });
    }),
};

