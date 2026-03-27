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
        Accept: 'application/json',
        'X-Return-Format': 'markdown',
      },
      timeout: 15000,
    })

    if (response.data && response.data.data) {
      const result = response.data.data
      return {
        title: result.title || null,
        content: result.content ? result.content.substring(0, 15000) : null,
        imageUrl: result.image || null,
      }
    }

    return {
      title: null,
      content:
        typeof response.data === 'string'
          ? response.data.substring(0, 15000)
          : null,
    }
  } catch (error: any) {
    console.warn(`⚠️ Jina AI failed for ${url}. Falling back to raw HTML extraction browser bypass...`)

    try {
      const { load } = await import('cheerio')
      const fallbackResponse = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        timeout: 10000,
      })

      const $ = load(fallbackResponse.data)
      const title = $('title').text() || $('h1').first().text() || null

      // Remove junk
      $('script, style, nav, footer, header, aside, noscript, svg').remove()
      const content = $('body').text().replace(/\s+/g, ' ').trim()

      return {
        title: title ? title.trim() : null,
        content: content ? content.substring(0, 15000) : null,
      }
    } catch (fallbackError) {
      console.error(`❌ Complete scraping failure for ${url}:`, (fallbackError as Error).message)
      return { title: null, content: null }
    }
  }
}
