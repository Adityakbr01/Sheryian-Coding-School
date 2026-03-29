import { Analytics } from '../models/Analytics.ts';
import { Negotiation } from '../models/Negotiation.ts';
import type { Tactic } from '../models/Negotiation.ts';
import type { ResistanceLevel } from '../models/Analytics.ts';

export const learningService = {
    /**
     * Record tactic usage after a session ends
     */
    recordTacticUsage: async (tactic: Tactic, wasSuccessful: boolean, discountAchieved: number): Promise<void> => {
        try {
            await Analytics.findOneAndUpdate(
                { tactic },
                {
                    $inc: {
                        totalUses: 1,
                        successCount: wasSuccessful ? 1 : 0,
                        avgDiscountAchieved: discountAchieved,
                    },
                    $set: { lastUpdated: new Date() },
                },
                { upsert: true, returnDocument: 'after' },
            );

            // Recalculate success rate and resistance level
            await learningService.recalculateResistance(tactic);
        } catch (err) {
            console.error('Failed to record tactic usage:', err);
        }
    },

    recalculateResistance: async (tactic: Tactic): Promise<void> => {
        const record = await Analytics.findOne({ tactic });
        if (!record || record.totalUses === 0) return;

        const rate = record.successCount / record.totalUses;
        let level: ResistanceLevel = 'low';
        if (rate > 0.7) level = 'high';
        else if (rate > 0.4) level = 'medium';

        await Analytics.updateOne({ tactic }, {
            $set: { successRate: rate, aiResistanceLevel: level },
        });
    },

    /**
     * Get resistance boosts for all tactics (used in prompt building)
     */
    getResistanceBoosts: async (): Promise<Record<string, number>> => {
        try {
            const analytics = await Analytics.find({});
            const boosts: Record<string, number> = {};
            for (const a of analytics) {
                if (a.aiResistanceLevel === 'high') boosts[a.tactic] = 0.4;
                else if (a.aiResistanceLevel === 'medium') boosts[a.tactic] = 0.2;
                else boosts[a.tactic] = 0;
            }
            return boosts;
        } catch {
            return {};
        }
    },

    /**
     * Run full analytics recomputation (called periodically)
     */
    runAnalyticsJob: async (): Promise<void> => {
        try {
            const completedSessions = await Negotiation.find({ isComplete: true }).select('tacticsUsed success basePrice finalPrice');

            const tacticStats: Record<string, { uses: number; wins: number; totalDiscount: number }> = {};

            for (const session of completedSessions) {
                const discount = session.finalPrice ? ((session.basePrice - session.finalPrice) / session.basePrice) * 100 : 0;
                for (const tactic of session.tacticsUsed) {
                    if (!tacticStats[tactic]) tacticStats[tactic] = { uses: 0, wins: 0, totalDiscount: 0 };
                    tacticStats[tactic]!.uses++;
                    if (session.success) tacticStats[tactic]!.wins++;
                    tacticStats[tactic]!.totalDiscount += discount;
                }
            }

            for (const [tactic, stats] of Object.entries(tacticStats)) {
                const rate = stats.uses > 0 ? stats.wins / stats.uses : 0;
                const avgDiscount = stats.uses > 0 ? stats.totalDiscount / stats.uses : 0;
                let level: ResistanceLevel = 'low';
                if (rate > 0.7) level = 'high';
                else if (rate > 0.4) level = 'medium';

                await Analytics.findOneAndUpdate(
                    { tactic },
                    { totalUses: stats.uses, successCount: stats.wins, successRate: rate, avgDiscountAchieved: avgDiscount, aiResistanceLevel: level, lastUpdated: new Date() },
                    { upsert: true },
                );
            }

            console.log('✅ Analytics job completed');
        } catch (err) {
            console.error('Analytics job failed:', err);
        }
    },
};

