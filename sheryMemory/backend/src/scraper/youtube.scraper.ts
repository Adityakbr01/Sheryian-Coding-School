import axios from 'axios'

export interface ScrapedYouTube {
  title: string | null
  content: string | null
  imageUrl?: string | null
}

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
  )
  return match ? match[1] : null
}

async function fetchTranscript(videoId: string, url: string): Promise<string | null> {
  const endpoints = [
    `https://youtubetranscript.com/?server_vid=${videoId}&format=json`,
    `https://youtubetranscript.com/?url=${encodeURIComponent(url)}&format=json`,
  ]

  for (const endpoint of endpoints) {
    try {
      const { data } = await axios.get(endpoint, {
        timeout: 12000,
        headers: { Accept: 'application/json' },
      })

      const segments = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.transcript)
          ? (data as any).transcript
          : null

      if (!segments) continue

      const transcript = segments
        .map((segment: any) => segment?.text)
        .filter(Boolean)
        .join(' ')
        .trim()

      if (transcript) return transcript.substring(0, 15000)
    } catch (error) {
      console.warn(`⚠️ Failed transcript endpoint for video ${videoId}: ${endpoint}`, error)
    }
  }

  return null
}

export async function scrapeYouTube(url: string): Promise<ScrapedYouTube> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await axios.get(oembedUrl, { timeout: 10000 })

    const title = response.data.title || null
    const author = response.data.author_name || ''

    const videoId = extractVideoId(url)
    const imageUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null

    const transcript = videoId ? await fetchTranscript(videoId, url) : null

    const contentParts = [
      author ? `YouTube video by ${author}` : 'YouTube video',
      title ? `Title: ${title}` : null,
      transcript ? `Transcript: ${transcript}` : null,
    ].filter(Boolean)

    const content = contentParts.length > 0 ? contentParts.join('\n\n') : null

    return {
      title,
      content,
      ...(imageUrl ? { imageUrl } : {}),
    }
  } catch (error) {
    console.error(`Failed to scrape YouTube video at ${url}:`, error)
    return { title: null, content: null }
  }
}
