import type { Request, Response } from 'express';
import { Analytics } from '../../models/Analytics.ts';
import { Negotiation } from '../../models/Negotiation.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import { cacheGet, cacheSet } from '../../configs/redis.ts';
import { analyticsQueue } from '../../bullmq/queues.ts';
import { io } from '../../socket.ts';

export const analyticsController = {
    getTacticStats: asyncCatch(async (_req: Request, res: Response) => {
        const stats = await Analytics.find({}).sort({ totalUses: -1 });
        sendResponse({ res, data: stats });
    }),

    getMoodDistribution: asyncCatch(async (_req: Request, res: Response) => {
        const sessions = await Negotiation.find({ isComplete: true }).select('moodHistory');
        const moodCounts: Record<string, number> = { neutral: 0, happy: 0, annoyed: 0, desperate: 0 };

        for (const s of sessions) {
            for (const mood of s.moodHistory) {
                moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
            }
        }

        const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
        const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
            mood,
            count,
            percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }));

        sendResponse({ res, data: distribution });
    }),

    getDifficultyStats: asyncCatch(async (_req: Request, res: Response) => {
        const stats = await Negotiation.aggregate([
            { $match: { isComplete: true } },
            {
                $group: {
                    _id: '$difficulty',
                    totalGames: { $sum: 1 },
                    wins: { $sum: { $cond: ['$success', 1, 0] } },
                    avgRounds: { $avg: '$totalRounds' },
                    avgDiscount: {
                        $avg: {
                            $cond: [
                                { $and: ['$finalPrice', '$basePrice'] },
                                { $multiply: [{ $divide: [{ $subtract: ['$basePrice', '$finalPrice'] }, '$basePrice'] }, 100] },
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const data = stats.map((s) => ({
            difficulty: s._id,
            totalGames: s.totalGames,
            wins: s.wins,
            winRate: s.totalGames > 0 ? Math.round((s.wins / s.totalGames) * 1000) / 10 : 0,
            avgRounds: Math.round(s.avgRounds * 10) / 10,
            avgDiscount: Math.round(s.avgDiscount * 10) / 10,
        }));

        sendResponse({ res, data });
    }),

    runAnalyticsJob: asyncCatch(async (_req: Request, res: Response) => {
        await analyticsQueue.add('run-analytics', {}, { jobId: `analytics-${Date.now()}` });
        sendResponse({ res, message: 'Analytics job queued' });
    }),

    getSummary: asyncCatch(async (_req: Request, res: Response) => {
        const CACHE_KEY = 'analytics:summary';
        const cached = await cacheGet(CACHE_KEY);
        if (cached) {
            return sendResponse({
                res,
                data: {
                    items: cached,
                    cache: { blagCache: true, cachedBy: 'redis', source: 'analytics:summary' },
                },
            });
        }

        const [totalSessions, completedSessions, totalWins] = await Promise.all([
            Negotiation.countDocuments({}),
            Negotiation.countDocuments({ isComplete: true }),
            Negotiation.countDocuments({ isComplete: true, success: true }),
        ]);

        const avgDeal = await Negotiation.aggregate([
            { $match: { isComplete: true, success: true, finalPrice: { $exists: true } } },
            { $group: { _id: null, avgDiscount: { $avg: { $multiply: [{ $divide: [{ $subtract: ['$basePrice', '$finalPrice'] }, '$basePrice'] }, 100] } } } },
        ]);

        const summaryData = {
            totalSessions,
            completedSessions,
            totalWins,
            globalWinRate: completedSessions > 0 ? Math.round((totalWins / completedSessions) * 1000) / 10 : 0,
            avgDiscountAchieved: avgDeal[0]?.avgDiscount ? Math.round(avgDeal[0].avgDiscount * 10) / 10 : 0,
        };
        await cacheSet(CACHE_KEY, summaryData, 60);
        io?.emit('analytics:update', { source: 'analytics:getSummary', timestamp: new Date().toISOString() });
        sendResponse({ res, data: { items: summaryData, cache: { blagCache: false } } });
    }),
};

