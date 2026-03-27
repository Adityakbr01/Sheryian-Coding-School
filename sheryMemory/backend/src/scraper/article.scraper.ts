import axios from 'axios'

export interface ScrapedArticle {
    title: string | null
    content: string | null
    imageUrl?: string | null
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
    try {
        // Use Jina AI Reader API for vastly superior content extraction and bot-bypass
        const jinaUrl = `https://r.jina.ai/${url}`
        const response = await axios.get(jinaUrl, {
            headers: {
                // Requesting JSON structure from Jina API
                'Accept': 'application/json',
                'X-Return-Format': 'markdown'
            },
            timeout: 15000,
        })

        if (response.data && response.data.data) {
            const result = response.data.data;
            return {
                title: result.title || null,
                content: result.content ? result.content.substring(0, 15000) : null,
                imageUrl: result.image || null
            }
        }
        
        return {
            title: null,
            content: typeof response.data === 'string' ? response.data.substring(0, 15000) : null
        }
        
    } catch (error: any) {
        console.error(`Failed to scrape article using Jina AI at ${url}:`, error?.message || error)
        return { title: null, content: null }
    }
}
