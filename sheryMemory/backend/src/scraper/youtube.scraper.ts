import axios from 'axios'

export interface ScrapedYouTube {
    title: string | null
    content: string | null
}

export async function scrapeYouTube(url: string): Promise<ScrapedYouTube> {
    try {
        // We can use the public oEmbed API for YouTube to get basic title and author details instantly
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`

        const response = await axios.get(oembedUrl, { timeout: 10000 })

        const title = response.data.title || null
        const author = response.data.author_name || ''

        // For a deeper scrape, we could parse the HTML description, 
        // but oEmbed provides a fast metadata representation.
        const content = `YouTube Video by ${author}. Title: ${title}`
        
        // Extract native high quality thumbnail ID
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        const imageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null

        return {
            title,
            content,
            ...(imageUrl ? { imageUrl } : {})
        }
    } catch (error) {
        console.error(`Failed to scrape YouTube video at ${url}:`, error)
        return { title: null, content: null }
    }
}
