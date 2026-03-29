import type { Request, Response } from 'express';
import { Negotiation } from '../../models/Negotiation.ts';
import { Product } from '../../models/Product.ts';
import { tacticService } from '../../services/tacticService.ts';
import { moodService } from '../../services/moodService.ts';
import { pricingService } from '../../services/pricingService.ts';
import { learningService } from '../../services/learningService.ts';
import { llmService } from '../../services/llmService.ts';
import { buildSellerSystemPrompt } from '../../prompts/sellerSystemPrompt.ts';
import { User } from '../../models/User.ts';
import { logger } from '../../services/loggerService.ts';
import { asyncCatch } from '../../utils/asyncCatch.ts';
import { AppError } from '../../utils/AppError.ts';
import { sendResponse } from '../../utils/apiResponse.ts';
import { cacheDel } from '../../configs/redis.ts';
import { io } from '../../socket.ts';
import { normalizeMessage, extractPrice, validatePriceEcho, hardFixBuyerPrice } from '../../utils/normalizeMessage.ts';
import zod from 'zod';

const negotiateSchema = zod.object({
    sessionId: zod.string().min(1),
    message: zod.string().min(1).max(500),
    facialEmotion: zod.string().optional(),
});

function extractRupeeNumbers(text: string): number[] {
    return [...text.matchAll(/₹\s*(\d+(?:,\d{2,3})*(?:\.\d+)?)/g)]
        .map((m) => parseFloat((m[1] ?? '0').replace(/,/g, '')))
        .filter((n) => Number.isFinite(n));
}

function hasSellerPrice(aiMsg: string, sellerPrice: number): boolean {
    return extractRupeeNumbers(aiMsg).some((p) => p === sellerPrice);
}

function hasMalformedRupeeFormatting(text: string): boolean {
    const tokens = [...text.matchAll(/₹\s*([\d,]+)/g)].map((m) => m[1] ?? '');
    return tokens.some((token) => {
        const compact = token.replace(/,/g, '');
        if (!/^\d+$/.test(compact)) return true;
        const numeric = Number.parseInt(compact, 10);
        if (!Number.isFinite(numeric)) return true;
        const canonical = numeric.toLocaleString('en-IN');
        const isNoComma = token === compact;
        const isCanonical = token === canonical;
        return !(isNoComma || isCanonical);
    });
}

function isReplyQualityGood(reply: string): boolean {
    const trimmed = reply.trim();
    if (trimmed.length < 45) return false;
    if (!/[.!?।]/.test(trimmed)) return false;
    if (hasMalformedRupeeFormatting(trimmed)) return false;
    return true;
}

function normalizeForSimilarity(text: string): string {
    return text
        .toLowerCase()
        .replace(/₹\s*\d+(?:,\d{2,3})*(?:\.\d+)?/g, '₹x')
        .replace(/[^a-z0-9₹\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function hasRepetitiveOpening(reply: string, history: { role: string; content: string }[]): boolean {
    const candidateStart = normalizeForSimilarity(reply).slice(0, 90);
    if (candidateStart.length < 20) return false;

    const recentSellerStarts = history
        .filter((m) => m.role === 'assistant')
        .slice(-3)
        .map((m) => normalizeForSimilarity(m.content).slice(0, 90))
        .filter((s) => s.length >= 20);

    return recentSellerStarts.some((prev) => (
        candidateStart === prev ||
        candidateStart.startsWith(prev) ||
        prev.startsWith(candidateStart)
    ));
}

function buildSafeFallbackReply(buyerPrice: number | null, sellerPrice: number, roundNumber: number): string {
    const sellerText = `₹${sellerPrice.toLocaleString('en-IN')}`;
    const opener = ['Arre yaar,', 'Bhai suno,', 'Dekho dost,'][roundNumber % 3] ?? 'Arre bhai,';

    if (buyerPrice === null) {
        return `${opener} thoda clear offer bolo. Mera current offer ${sellerText} hai, uske aas paas baat karo.`;
    }

    const buyerText = `₹${buyerPrice.toLocaleString('en-IN')}`;
    const reason = [
        `${buyerText} pe deal mushkil hai.`,
        `${buyerText} ka offer kaafi low lag raha hai.`,
        `${buyerText} se niche quality justify nahi hoti.`,
    ][roundNumber % 3] ?? `${buyerText} pe deal mushkil hai.`;

    return `${opener} ${reason} Mera current offer ${sellerText} hai, realistic number pe close karte hain.`;
}

export const negotiateController = {
    negotiate: async (req: Request, res: Response) => {
        // ── SSE setup ────────────────────────────────────────────────────────
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const sendEvent = (event: string, data: unknown) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        try {
            const { sessionId, message: rawMessage, facialEmotion } = negotiateSchema.parse(req.body);
            const userId = (req as any).user?.id;
            if (!userId) { sendEvent('error', { message: 'Unauthorized' }); res.end(); return; }

            // Normalize price shorthand: "20k" → "₹20,000", "2k" → "₹2,000"
            const message = normalizeMessage(rawMessage);
            if (message !== rawMessage) {
                logger.debug('Message normalized', { original: rawMessage, normalized: message });
            }

            const session = await Negotiation.findOne({ _id: sessionId, userId });
            if (!session) { sendEvent('error', { message: 'Session not found' }); res.end(); return; }
            if (session.isComplete) { sendEvent('error', { message: 'Negotiation already complete' }); res.end(); return; }

            const roundNumber = session.totalRounds + 1;
            const resistanceBoosts = await learningService.getResistanceBoosts();
            const conversationHistory = session.messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            }));

            // Include current buyer message so LLM sees complete first→latest context.
            const conversationHistoryWithCurrent = [
                ...conversationHistory,
                { role: 'user', content: message },
            ];

            // CALL 1: Classify tactic — emit immediately
            logger.debug('Classifying tactic', { sessionId, roundNumber, facialEmotion });
            const tacticResult = await tacticService.classify(message, conversationHistory, facialEmotion);
            const newMood = moodService.transition(session.currentMood, tacticResult.tactic, roundNumber, session.maxRounds);
            const updatedMoodHistory = [...session.moodHistory, newMood];
            const isWalkaway = moodService.shouldWalkaway(updatedMoodHistory, session.difficulty);
            const priceResult = pricingService.calculate({
                basePrice: session.basePrice, minimumPrice: session.minimumPrice,
                currentPrice: session.currentPrice, mood: newMood,
                tactic: tacticResult.tactic, roundNumber, maxRounds: session.maxRounds,
                difficulty: session.difficulty, resistanceBoosts,
            });

            // Send tactic + price metadata to client immediately
            sendEvent('meta', {
                tactic: tacticResult.tactic,
                tacticConfidence: tacticResult.confidence,
                newPrice: priceResult.newPrice,
                mood: newMood,
                roundNumber,
                isWalkaway,
                discount: priceResult.discount,
            });

            logger.debug('Tactic classified', { tactic: tacticResult.tactic, confidence: tacticResult.confidence, mood: newMood, isWalkaway });

            // CALL 2: Generate seller reply with validation pipeline (Phase 6-8)
            let sellerReply = '';
            if (isWalkaway) {
                sellerReply = `Yaar, main bahut disappoint hoon. Itna negotiate karte hoge... Theek hai, I'm walking away. Deal khatam. 🚶`;
                sendEvent('reply_chunk', { chunk: sellerReply });
            } else {
                const buyerPrice = extractPrice(message);
                const productDetails = await Product.findOne({ id: session.productId }).lean();

                const sellerPrompt = buildSellerSystemPrompt({
                    productId: session.productId,
                    productName: productDetails?.name ?? session.productName,
                    productDescription: productDetails?.description ?? `${session.productName} from catalog`,
                    productEmoji: productDetails?.emoji ?? '🛍️',
                    basePrice: session.basePrice,
                    minimumPrice: session.minimumPrice, currentPrice: priceResult.newPrice,
                    roundNumber, maxRounds: session.maxRounds, mood: newMood,
                    tactic: tacticResult.tactic, difficulty: session.difficulty,
                    resistanceBoosts, conversationHistory: conversationHistoryWithCurrent,
                    maxPriceDrop: priceResult.maxPriceDrop,
                    buyerOfferPrice: buyerPrice,
                });

                // Phase 7: Retry loop — enforce price correctness + complete response quality
                let validated = false;
                for (let attempt = 0; attempt < 3; attempt++) {
                    sellerReply = await llmService.generate(sellerPrompt);

                    const buyerEchoOk = buyerPrice === null || validatePriceEcho(message, sellerReply);
                    const sellerPriceOk = hasSellerPrice(sellerReply, priceResult.newPrice);
                    const qualityOk = isReplyQualityGood(sellerReply);
                    const repetitionOk = !hasRepetitiveOpening(sellerReply, conversationHistory);

                    if (buyerEchoOk && sellerPriceOk && qualityOk && repetitionOk) {
                        validated = true;
                        logger.debug(`[Validate] ✅ Response valid (attempt ${attempt + 1})`, {
                            buyerPrice,
                            sellerPrice: priceResult.newPrice,
                            repetitionOk,
                        });
                        break;
                    }

                    logger.warn(`[Validate] ❌ Response validation failed (attempt ${attempt + 1})`, {
                        buyerPrice,
                        sellerPrice: priceResult.newPrice,
                        buyerEchoOk,
                        sellerPriceOk,
                        qualityOk,
                        repetitionOk,
                        aiResponse: sellerReply.slice(0, 100),
                    });
                }

                // Phase 8: Hard-fix + deterministic fallback if validation still fails
                if (!validated) {
                    if (buyerPrice !== null) {
                        sellerReply = hardFixBuyerPrice(sellerReply, buyerPrice, priceResult.newPrice);
                    }

                    const sellerPriceOk = hasSellerPrice(sellerReply, priceResult.newPrice);
                    const qualityOk = isReplyQualityGood(sellerReply);
                    if (!sellerPriceOk || !qualityOk) {
                        sellerReply = buildSafeFallbackReply(buyerPrice, priceResult.newPrice, roundNumber);
                    }

                    logger.warn('[Validate] 🔧 Applied fallback to ensure complete response', {
                        buyerPrice,
                        sellerPrice: priceResult.newPrice,
                    });
                }

                // Stream the final validated reply to the client
                sendEvent('reply_chunk', { chunk: sellerReply });
            }

            const isLastRound = roundNumber >= session.maxRounds;
            const dealClosed = isLastRound && !isWalkaway;
            const updatedTactics = session.tacticsUsed.includes(tacticResult.tactic)
                ? session.tacticsUsed : [...session.tacticsUsed, tacticResult.tactic];

            const updateQuery: any = {
                $set: {
                    currentPrice: priceResult.newPrice, currentMood: newMood,
                    totalRounds: roundNumber, moodHistory: updatedMoodHistory,
                    tacticsUsed: updatedTactics, isComplete: isWalkaway || dealClosed,
                    isWalkaway, success: dealClosed && !isWalkaway,
                    finalPrice: (isWalkaway || dealClosed) ? priceResult.newPrice : undefined,
                },
                $push: {
                    messages: {
                        $each: [
                            { role: 'user', content: message, tactic: tacticResult.tactic, mood: newMood, priceAtRound: priceResult.newPrice, timestamp: new Date() },
                            { role: 'ai', content: sellerReply, mood: newMood, priceAtRound: priceResult.newPrice, timestamp: new Date() },
                        ]
                    }
                },
            };

            if (facialEmotion) {
                updateQuery.$push.facialEmotions = facialEmotion;
            }

            // Persist to DB
            await Negotiation.updateOne({ _id: sessionId }, updateQuery);

            if ((isWalkaway || dealClosed) && userId) {
                await User.findByIdAndUpdate(userId, {
                    $inc: { totalSessions: 1, ...(dealClosed && !isWalkaway ? { wins: 1, score: Math.round(((session.basePrice - priceResult.newPrice) / session.basePrice) * 100) } : {}) },
                });

                // Invalidate leaderboard+analytics caches on session complete
                await cacheDel('leaderboard:global', 'leaderboard:best-deals', 'analytics:summary');
                io?.emit('leaderboard:update', { source: 'negotiate:session-end', timestamp: new Date().toISOString() });
                io?.emit('analytics:update', { source: 'negotiate:session-end', timestamp: new Date().toISOString() });
            }
            for (const tactic of updatedTactics) {
                await learningService.recordTacticUsage(tactic, dealClosed && !isWalkaway, priceResult.discount);
            }

            logger.info('Negotiate round complete', { sessionId, roundNumber, tactic: tacticResult.tactic, newPrice: priceResult.newPrice, dealClosed, isWalkaway });

            // Final event — signals the client the stream is done
            sendEvent('done', { dealClosed, isWalkaway, reply: sellerReply });
            res.end();
        } catch (err: any) {
            logger.error('Negotiate SSE error', { message: err.message, stack: err.stack });
            sendEvent('error', { message: err.message || 'Internal server error' });
            res.end();
        }
    },

    acceptDeal: asyncCatch(async (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const userId = (req as any).user?.id;

        const session = await Negotiation.findOne({ _id: sessionId, userId });
        if (!session) throw new AppError('Session not found', 404);
        if (session.isComplete) throw new AppError('Already complete', 400);

        await Negotiation.updateOne({ _id: sessionId }, {
            $set: { isComplete: true, success: true, finalPrice: session.currentPrice },
        });

        await User.findByIdAndUpdate(userId, {
            $inc: { totalSessions: 1, wins: 1, score: Math.round(((session.basePrice - session.currentPrice) / session.basePrice) * 100) },
        });

        await cacheDel('leaderboard:global', 'leaderboard:best-deals', 'analytics:summary');
        io?.emit('leaderboard:update', { source: 'negotiate:acceptDeal', timestamp: new Date().toISOString() });
        io?.emit('analytics:update', { source: 'negotiate:acceptDeal', timestamp: new Date().toISOString() });

        sendResponse({
            res,
            data: {
                finalPrice: session.currentPrice,
                totalRounds: session.totalRounds,
                discount: Math.round(((session.basePrice - session.currentPrice) / session.basePrice) * 100 * 10) / 10,
                tacticsUsed: session.tacticsUsed,
                moodHistory: session.moodHistory,
            },
        });
    }),
};

