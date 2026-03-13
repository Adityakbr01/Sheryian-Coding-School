import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedArticle {
    title: string | null
    content: string | null
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
        })

        const html = response.data
        const $ = cheerio.load(html)

        // Remove scripts, styles, logic
        $('script, style, noscript, iframe, nav, footer, header, aside').remove()

        const title = $('title').text().trim() || $('h1').first().text().trim() || null

        // Attempt to grab main article content, fallback to body text
        let content = $('article').text().trim() || $('main').text().trim() || $('body').text().trim()

        // Clean up excessive whitespace
        content = content.replace(/\s+/g, ' ').trim()

        return {
            title,
            content: content ? content.substring(0, 15000) : null, // Limit text length for LLM context
        }
    } catch (error) {
        console.error(`Failed to scrape article at ${url}:`, error)
        return { title: null, content: null }
    }
}
