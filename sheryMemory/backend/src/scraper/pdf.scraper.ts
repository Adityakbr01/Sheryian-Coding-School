import axios from 'axios'
import pdfParse from 'pdf-parse'

export interface ScrapedPDF {
  title: string | null
  content: string | null
}

export async function scrapePDF(url: string): Promise<ScrapedPDF> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
    })

    const dataBuffer = Buffer.from(response.data)

    // Extract text using pdf-parse
    const pdfData = await pdfParse(dataBuffer)

    const content = pdfData.text.replace(/\s+/g, ' ').trim()
    let title = pdfData.info?.Title || url.split('/').pop() || 'PDF Document'

    // Google Docs and converters inject "(anonymous)" or "Untitled" often
    if (title.toLowerCase().includes('anonymous') || title.toLowerCase().includes('untitled')) {
      try {
        const urlObj = new URL(url)
        title = urlObj.pathname.split('/').pop() || 'PDF Document'
      } catch (e) {
        title = 'PDF Document'
      }
    }

    return {
      title: title.trim(),
      content: content ? content.substring(0, 15000) : null,
    }
  } catch (error) {
    console.error(`Failed to scrape PDF at ${url}:`, error)
    return { title: null, content: null }
  }
}
