import { LangchainClient } from '../config/langchain.client'
import { tagPromptTemplate } from './prompts/tag.prompt'

export async function generateTags(text: string): Promise<string[]> {
  try {
    const chain = tagPromptTemplate.pipe(
      LangchainClient.getChatInstance() as any,
    )
    const response = (await chain.invoke({
      text: text.substring(0, 5000),
    })) as any

    // The response is an AIMessage whose content is expected to be a raw JSON array string
    const tagsString = response.content as string
    const tags = JSON.parse(
      tagsString.replace(/```json/g, '').replace(/```/g, ''),
    )

    if (Array.isArray(tags)) {
      return tags.map((tag) => String(tag).toLowerCase().trim())
    }
    return []
  } catch (error) {
    console.error('Failed to generate tags:', error)
    return []
  }
}
