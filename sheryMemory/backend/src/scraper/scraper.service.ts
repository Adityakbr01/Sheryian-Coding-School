import { scrapeArticle } from './article.scraper'
import { scrapeYouTube } from './youtube.scraper'
import { scrapePDF } from './pdf.scraper'
import { scrapeTweet } from './tweet.scraper'

export interface ScrapedData {
    title: string | null
    content: string | null
    type: 'article' | 'video' | 'tweet' | 'pdf' | 'image'
    imageUrl?: string | null
}

function detectType(url: string): ScrapedData['type'] {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'tweet'
    if (url.toLowerCase().endsWith('.pdf')) return 'pdf'
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return 'image'
    return 'article'
}

export class ScraperService {
    static async scrape(url: string): Promise<ScrapedData> {
        const type = detectType(url)

        let result: { title: string | null, content: string | null, imageUrl?: string | null } = { title: null, content: null }

        switch (type) {
            case 'video':
                result = await scrapeYouTube(url)
                break
            case 'tweet':
                result = await scrapeTweet(url)
                break
            case 'pdf':
                result = await scrapePDF(url)
                break
            case 'image':
                result = { title: 'Image Resource', content: `Direct link to image: ${url}` }
                break
            case 'article':
            default:
                result = await scrapeArticle(url)
                break
        }

        return {
            title: result.title,
            content: result.content,
            type,
            ...(result.imageUrl ? { imageUrl: result.imageUrl } : {})
        }
    }
}
