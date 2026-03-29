import { llmService } from './llmService.ts';
import { buildClassifyPrompt } from '../prompts/classifyPrompt.ts';
import type { Tactic } from '../models/Negotiation.ts';

export interface TacticResult {
    tactic: Tactic;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    reasoning: string;
}

const VALID_TACTICS: Tactic[] = ['emotional', 'logical', 'aggressive', 'passive', 'flattery', 'anchor'];

export const tacticService = {
    classify: async (
        userMessage: string,
        conversationHistory: { role: string; content: string }[],
        facialEmotion?: string,
    ): Promise<TacticResult> => {
        try {
            const prompt = buildClassifyPrompt(userMessage, conversationHistory, facialEmotion);
            const raw = await llmService.classify(prompt);
            const parsed = JSON.parse(raw);

            const tactic = VALID_TACTICS.includes(parsed.tactic) ? parsed.tactic : 'passive';
            const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5;
            const sentiment = ['positive', 'negative', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral';

            return { tactic, confidence, sentiment, reasoning: parsed.reasoning || '' };
        } catch (err) {
            console.error('Tactic classification failed:', err);
            return { tactic: 'passive', confidence: 0.5, sentiment: 'neutral', reasoning: 'Fallback classification' };
        }
    },
};

