import type { Mood, Tactic } from '../models/Negotiation.ts';

// Mood transitions are now softer — anchor from neutral stays neutral (first anchor isn't rude),
// repeated anchoring from annoyed stays annoyed, emotional/flattery can recover from annoyed.
const MOOD_TRANSITIONS: Record<Mood, Record<Tactic, Mood>> = {
    neutral: {
        emotional: 'happy',
        logical: 'happy',
        flattery: 'happy',
        passive: 'neutral',
        aggressive: 'annoyed',
        anchor: 'neutral',      // First anchor is normal negotiation, not rude
    },
    happy: {
        emotional: 'happy',
        logical: 'happy',
        flattery: 'happy',
        passive: 'neutral',
        aggressive: 'annoyed',
        anchor: 'neutral',      // Anchoring from happy → drops to neutral, not annoyed
    },
    annoyed: {
        emotional: 'neutral',   // Emotional appeal can calm down annoyed seller
        logical: 'neutral',     // Good logic calms the seller
        flattery: 'happy',      // Flattery is very effective when annoyed
        passive: 'neutral',     // Passive breaks the annoyance cycle
        aggressive: 'annoyed',  // Aggression keeps the seller annoyed
        anchor: 'annoyed',      // Repeated anchoring while already annoyed stays annoyed
    },
    desperate: {
        emotional: 'desperate',
        logical: 'desperate',
        flattery: 'desperate',
        passive: 'desperate',
        aggressive: 'desperate',
        anchor: 'desperate',
    },
};

export const moodService = {
    /**
     * Compute the next mood based on current mood, tactic, and round progress.
     * Only goes desperate at 90% of rounds (not 80%), and only if not happy.
     */
    transition: (currentMood: Mood, tactic: Tactic, roundNumber: number, maxRounds: number): Mood => {
        const roundRatio = roundNumber / maxRounds;

        // Only go desperate very late in the game
        if (roundRatio >= 0.9 && currentMood !== 'happy') {
            return 'desperate';
        }

        return MOOD_TRANSITIONS[currentMood][tactic] ?? currentMood;
    },

    /**
     * How many consecutive annoyed rounds? Used for walk-away check.
     */
    countConsecutiveAnnoyed: (moodHistory: Mood[]): number => {
        let count = 0;
        for (let i = moodHistory.length - 1; i >= 0; i--) {
            if (moodHistory[i] === 'annoyed') count++;
            else break;
        }
        return count;
    },

    /**
     * Determine if the AI should walk away.
     * Thresholds are now much higher so the buyer gets more chances.
     * Easy: 8 consecutive annoyed, Medium: 6, Hard: 4
     */
    shouldWalkaway: (moodHistory: Mood[], difficulty: string): boolean => {
        const consecutiveAnnoyed = moodService.countConsecutiveAnnoyed(moodHistory);
        const threshold = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 6 : 8;
        return consecutiveAnnoyed >= threshold;
    },

    getMoodEmoji: (mood: Mood): string => {
        const emojis: Record<Mood, string> = { neutral: '😐', happy: '😊', annoyed: '😤', desperate: '😰' };
        return emojis[mood];
    },
};


