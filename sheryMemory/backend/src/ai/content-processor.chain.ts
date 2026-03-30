import { LangchainClient } from '../config/langchain.client'
import { PromptTemplate } from '@langchain/core/prompts'
import { logger } from '../utils/logger'

/**
 * Unified prompt that extracts summary, tags, insight, and highlights
 * in a single Gemini API call — eliminating redundant requests.
 */
const contentProcessorPrompt = PromptTemplate.fromTemplate(`
You are an expert knowledge curator. Analyze the following content and return structured metadata.

CONTENT:
{text}

Respond STRICTLY in valid JSON with this exact structure:
{{
  "summary": "A concise 2-3 sentence summary of the content",
  "tags": ["tag1", "tag2"],
  "insight": "A sharp 1-2 sentence realization about how this content connects to learning, philosophy, or productivity",
  "highlights": [
    {{
      "text": "An exact resonant quote from the content",
      "annotation": "A brief note explaining why this quote matters"
    }}
  ]
}}

Rules:
- max 5 tags (lowercase, single words or short phrases)
- max 5 highlights
- no markdown
- no explanation
`)

export interface ProcessedContent {
  summary: string | null
  tags: string[]
  insight: string | null
  highlights: Array<{ text: string; annotation: string }> | null
}

const FALLBACK_RESULT: ProcessedContent = {
  summary: null,
  tags: [],
  insight: null,
  highlights: null,
}

/**
 * Processes content through Gemini in a SINGLE API call.
 * Replaces the previous extractMetadata() + generateTags() dual-call pattern.
 */
export async function processContentWithAI(
  content: string,
): Promise<ProcessedContent> {
  try {
    const model = LangchainClient.getChatInstance()

    // Truncate to safe token budget (≈12k chars)
    const safeContent = content.substring(0, 12000)

    const chain = contentProcessorPrompt.pipe(model as any)
    const response = (await chain.invoke({ text: safeContent })) as any

    let raw = (response.content as string) ?? ''

    // Strip any markdown code fences the model may have wrapped
    raw = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    const data = JSON.parse(raw)

    return {
      summary: typeof data.summary === 'string' ? data.summary : null,
      tags: Array.isArray(data.tags)
        ? data.tags
          .slice(0, 5)
          .map((t: unknown) => String(t).toLowerCase().trim())
          .filter(Boolean)
        : [],
      insight: typeof data.insight === 'string' ? data.insight : null,
      highlights: Array.isArray(data.highlights)
        ? data.highlights.slice(0, 5)
        : null,
    }
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429')) {
      logger.warn(
        '⚠️ Gemini Quota Exceeded (429). Skipping AI content processing gracefully.',
      )
    } else {
      logger.error('Failed to process content with AI:', error)
    }
    return { ...FALLBACK_RESULT }
  }
}
