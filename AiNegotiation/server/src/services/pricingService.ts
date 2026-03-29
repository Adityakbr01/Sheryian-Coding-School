import type { Mood, Tactic, Difficulty } from '../models/Negotiation.ts';

interface PriceParams {
    basePrice: number;
    minimumPrice: number;
    currentPrice: number;
    mood: Mood;
    tactic: Tactic;
    roundNumber: number;
    maxRounds: number;
    difficulty: Difficulty;
    resistanceBoosts: Record<string, number>;
}

// Mood discount percentages (of current price gap above minimum)
const MOOD_DISCOUNT_PCT: Record<Mood, number> = {
    happy: 0.18,       // Happy seller gives bigger discounts
    neutral: 0.08,     // Was 0.06 — neutral should still move the needle
    annoyed: 0.03,     // Annoyed gives very little
    desperate: 0.14,   // Desperate — trying to close
};

// Tactic discount percentages
const TACTIC_DISCOUNT_PCT: Record<Tactic, number> = {
    emotional: 0.10,   // Was 0.08
    logical: 0.12,     // Was 0.10
    flattery: 0.09,    // Was 0.07
    passive: 0.02,     // Was 0.01
    aggressive: -0.03, // Penalty: price barely drops (was -0.05)
    anchor: 0.10,      // Was 0.04 — naming a price should be EFFECTIVE
};

// Difficulty starting price multiplier
const DIFFICULTY_START_MULTIPLIER: Record<Difficulty, number> = { easy: 0.75, medium: 0.90, hard: 1.0 };

export const pricingService = {
    getStartingPrice: (basePrice: number, difficulty: Difficulty): number => {
        return Math.round(basePrice * DIFFICULTY_START_MULTIPLIER[difficulty]);
    },

    calculate: (params: PriceParams): { newPrice: number; discount: number; maxPriceDrop: number } => {
        const { basePrice, minimumPrice, currentPrice, mood, tactic, roundNumber, maxRounds, difficulty, resistanceBoosts } = params;

        const gap = currentPrice - minimumPrice;
        if (gap <= 0) return { newPrice: minimumPrice, discount: 0, maxPriceDrop: 0 };

        // Resistance boost dampens the tactic discount
        const resistanceMultiplier = 1 - (resistanceBoosts[tactic] ?? 0) * 0.5;

        const moodDiscount = gap * MOOD_DISCOUNT_PCT[mood];
        const tacticDiscount = gap * TACTIC_DISCOUNT_PCT[tactic] * resistanceMultiplier;
        const roundDecay = gap * (0.10 * (roundNumber / maxRounds)); // Was 0.08 — late rounds drop faster

        // Difficulty modifier
        const diffModifier = difficulty === 'easy' ? 1.3 : difficulty === 'hard' ? 0.6 : 1.0;

        const totalDrop = Math.max(0, (moodDiscount + tacticDiscount + roundDecay) * diffModifier);

        // Ensure minimum drop per round so the price ALWAYS moves (at least ₹50 or 0.5% of gap)
        const minimumDrop = Math.max(50, gap * 0.005);
        const effectiveDrop = Math.max(totalDrop, minimumDrop);

        const maxPriceDrop = Math.round(effectiveDrop * 1.5);

        let newPrice = Math.round(currentPrice - effectiveDrop);
        newPrice = Math.max(minimumPrice, Math.min(newPrice, currentPrice)); // clamp

        const discountPct = ((basePrice - newPrice) / basePrice) * 100;

        console.log(`[Pricing] gap=₹${gap} mood=${mood}(${(moodDiscount).toFixed(0)}) tactic=${tactic}(${(tacticDiscount).toFixed(0)}) round=${roundNumber}/${maxRounds}(${(roundDecay).toFixed(0)}) diff=${difficulty}(×${diffModifier}) → drop=₹${effectiveDrop.toFixed(0)} | ₹${currentPrice}→₹${newPrice}`);

        return { newPrice, discount: Math.round(discountPct * 10) / 10, maxPriceDrop };
    },

    isDealAccepted: (offeredPrice: number, currentAiPrice: number, minimumPrice: number): boolean => {
        // User's offer is accepted if >= currentAiPrice, or AI is already at rock bottom
        return offeredPrice >= currentAiPrice || currentAiPrice <= minimumPrice + 10;
    },
};


