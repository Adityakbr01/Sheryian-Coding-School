import { LangchainClient } from "../config/langchain.client"

async function aiClean(text: string): Promise<string> {
    try {
        const chat = LangchainClient.getChatInstance()

        const prompt = `
Clean the following extracted web content.

Rules:
- Remove navigation, ads, menus
- Keep only meaningful article content
- Keep headings if useful
- Make it readable and structured
- Do NOT summarize, only clean

Content:
${text.slice(0, 12000)}
`

        const res = await chat.invoke(prompt)

        return res.content.toString()
    } catch (err) {
        console.warn('⚠️ AI cleaning failed')
        return text
    }
}

export default aiClean