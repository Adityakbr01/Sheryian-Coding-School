import { PromptTemplate } from '@langchain/core/prompts'

export const tagPromptTemplate = new PromptTemplate({
    template: `You are an expert content organizer and taxonomy generator.
Given the following content, generate exactly 5-7 highly relevant, broad categories or descriptive tags.
Do not output anything besides a raw JSON array of strings. Do not include markdown formatting like \`\`\`json.

Content:
{text}
`,
    inputVariables: ['text'],
})

export const summarizePromptTemplate = new PromptTemplate({
    template: `You are an expert summarizer.
Provide a concise, engaging summary of the following text in 2-3 sentences. Do not add conversational filler.

Text:
{text}
`,
    inputVariables: ['text'],
})
