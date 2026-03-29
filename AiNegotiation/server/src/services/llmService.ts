import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../configs/env.ts';

// ── Gemini client ─────────────────────────────────────────────────────────────
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return geminiClient;
}

// ── Gemini helpers ────────────────────────────────────────────────────────────
async function geminiClassify(prompt: string): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
            temperature: parseFloat(env.LLM_CLASSIFY_TEMP),
            responseMimeType: 'application/json',
        },
    });
    const systemInstruction = 'You are a negotiation tactic classifier. Always respond with valid JSON only.';
    const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
    return result.response.text() ?? '{}';
}

async function geminiGenerate(systemPrompt: string): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
            temperature: parseFloat(env.LLM_GENERATE_TEMP),
            maxOutputTokens: 300,
        },
    });
    const result = await model.generateContent(systemPrompt);
    return result.response.text().trim() ?? "Hmm, let me think about that...";
}

async function* geminiGenerateStream(systemPrompt: string): AsyncGenerator<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: { temperature: parseFloat(env.LLM_GENERATE_TEMP), maxOutputTokens: 300 },
    });
    const result = await model.generateContentStream(systemPrompt);
    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
    }
}

// ── Exported service ──────────────────────────────────────────────────────────
export const llmService = {
    classify: async (prompt: string): Promise<string> => {
        return geminiClassify(prompt);
    },

    generate: async (systemPrompt: string): Promise<string> => {
        return geminiGenerate(systemPrompt);
    },

    /** Streaming generator — yields text chunks as they arrive */
    generateStream: (systemPrompt: string): AsyncGenerator<string> => {
        return geminiGenerateStream(systemPrompt);
    },
};

