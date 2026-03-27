import { LangchainClient } from './langchain.client'
import { PromptTemplate } from '@langchain/core/prompts'

const extractorPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert knowledge curator. Analyze the following content and extract precise semantic metadata.

CONTENT:
{text}

Respond STRICTLY in valid JSON format with exactly the following structure:
{{
  "summary": "A concise 3-bullet executive summary (format as markdown bullet points)",
  "aiInsight": "A sharp, 1-2 sentence realization about how this data connects to human learning, philosophy, or productivity",
  "highlights": [
    {{
      "text": "The exact most resonant quote from the text",
      "annotation": "A brief AI note explaining why this quote is profound"
    }}
  ]
}}

Do NOT include any markdown code block wrappers like \`\`\`json around your response, just emit the raw JSON text.
`)

export interface ExtractedMetadata {
    summary: string | null;
    aiInsight: string | null;
    highlights: Array<{ text: string, annotation: string }> | null;
}

export async function extractMetadata(text: string): Promise<ExtractedMetadata> {
    try {
        const chain = extractorPromptTemplate.pipe(LangchainClient.getChatInstance() as any)
        
        // Jina markdown can be long; we truncate to first 12000 chars to avoid token limits
        const safeText = text.substring(0, 12000)
        const response = await chain.invoke({ text: safeText }) as any
        
        let rawContent = response.content as string
        rawContent = rawContent.replace(/^```(json)?/, '').replace(/```$/, '').trim()
        
        const data = JSON.parse(rawContent)
        
        return {
            summary: data.summary || null,
            aiInsight: data.aiInsight || null,
            highlights: Array.isArray(data.highlights) ? data.highlights : null
        }
    } catch (error) {
        console.error('Failed to extract metadata:', error)
        return { summary: null, aiInsight: null, highlights: null }
    }
}
