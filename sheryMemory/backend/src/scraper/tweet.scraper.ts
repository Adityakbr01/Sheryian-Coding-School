import axios from 'axios'

export interface ScrapedTweet {
  title: string | null
  content: string | null
  imageUrl?: string | null
}

interface TwitterOEmbedResponse {
  author_name?: string
  html?: string
  thumbnail_url?: string
}

interface FxTwitterUser {
  name?: string
  username?: string
  screen_name?: string
}

interface FxTwitterVariant {
  url?: string
  bitrate?: number
  content_type?: string
}

interface FxTwitterMediaItem {
  type?: string
  url?: string
  media_url?: string
  media_url_https?: string
  image_url?: string
  thumbnail_url?: string
  poster?: string
  preview_image_url?: string
  preview_url?: string
  variants?: FxTwitterVariant[]
}

interface FxTwitterMediaContainer {
  all?: FxTwitterMediaItem[]
  photos?: FxTwitterMediaItem[]
  videos?: FxTwitterMediaItem[]
  external?: FxTwitterMediaItem[]
}

interface FxTwitterTweet {
  text?: string
  full_text?: string
  content?: string
  author?: FxTwitterUser
  user?: FxTwitterUser
  media?: FxTwitterMediaContainer | FxTwitterMediaItem[]
}

interface FxTwitterResponse {
  tweet?: FxTwitterTweet
  text?: string
  content?: string
  author?: FxTwitterUser
  media?: FxTwitterMediaContainer | FxTwitterMediaItem[]
}

interface ScrapedMedia {
  imageUrls: string[]
  videoUrls: string[]
}

function compactText(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, ' ').trim()
  return normalized ? normalized : null
}

function normalizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null

  const cleaned = rawUrl.trim().replace(/[),.;!?]+$/g, '')
  if (!cleaned) return null

  try {
    const parsed = new URL(cleaned)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    parsed.hash = ''
    return parsed.toString()
  } catch {
    return null
  }
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const rawUrl of urls) {
    const normalized = normalizeUrl(rawUrl)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function isLikelyImageUrl(url: string): boolean {
  return /(pbs\.twimg\.com|twimg\.com|\.jpe?g(\?|$)|\.png(\?|$)|\.webp(\?|$)|\.gif(\?|$))/i.test(
    url,
  )
}

function isLikelyVideoUrl(url: string): boolean {
  return /(video\.twimg\.com|\.mp4(\?|$)|\.m3u8(\?|$)|\/vid\/)/i.test(url)
}

function normalizeUrlList(values: Array<string | null | undefined>): string[] {
  return dedupeUrls(values.filter((value): value is string => typeof value === 'string'))
}

function mergeMedia(...sources: ScrapedMedia[]): ScrapedMedia {
  return {
    imageUrls: dedupeUrls(sources.flatMap((source) => source.imageUrls)),
    videoUrls: dedupeUrls(sources.flatMap((source) => source.videoUrls)),
  }
}

function extractMediaFromText(text: string): ScrapedMedia {
  const rawUrls = text.match(/https?:\/\/[^\s<>"')\]]+/g) ?? []
  const normalizedUrls = dedupeUrls(rawUrls)

  return {
    imageUrls: normalizedUrls.filter((url) => isLikelyImageUrl(url)),
    videoUrls: normalizedUrls.filter((url) => isLikelyVideoUrl(url)),
  }
}

function buildContentWithMedia(
  baseContent: string | null | undefined,
  media: ScrapedMedia,
): string | null {
  const sections: string[] = []
  const cleanBase = compactText(baseContent)

  if (cleanBase) {
    sections.push(cleanBase)
  }

  if (media.imageUrls.length > 0) {
    sections.push(`Tweet images: ${media.imageUrls.join(' | ')}`)
  }

  if (media.videoUrls.length > 0) {
    sections.push(`Tweet videos: ${media.videoUrls.join(' | ')}`)
  }

  if (sections.length === 0) return null
  return sections.join('\n\n').substring(0, 15000)
}

function firstImageUrl(media: ScrapedMedia): string | null {
  return media.imageUrls[0] ?? null
}

function normalizeTweetUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim())
    const hostname = parsed.hostname.toLowerCase()

    if (
      hostname === 'twitter.com' ||
      hostname === 'www.twitter.com' ||
      hostname === 'mobile.twitter.com' ||
      hostname === 'm.twitter.com' ||
      hostname === 'x.com' ||
      hostname === 'www.x.com'
    ) {
      parsed.hostname = 'x.com'
    }

    parsed.hash = ''

    // Remove tracking params that are irrelevant for scraping.
    parsed.searchParams.delete('s')
    parsed.searchParams.delete('t')
    parsed.searchParams.delete('utm_source')
    parsed.searchParams.delete('utm_medium')
    parsed.searchParams.delete('utm_campaign')

    return parsed.toString()
  } catch {
    return rawUrl.trim()
  }
}

function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/[\w_]+\/status\/(\d{8,})/i)
  if (match?.[1]) return match[1]

  const genericMatch = url.match(/status\/(\d{8,})/i)
  return genericMatch?.[1] ?? null
}

function buildTitle(author: string | null, tweetId: string | null): string {
  if (author && tweetId) return `Tweet by ${author} (#${tweetId})`
  if (author) return `Tweet by ${author}`
  if (tweetId) return `Tweet #${tweetId}`
  return 'Tweet'
}

function pickFxText(payload: FxTwitterResponse): string | null {
  return compactText(
    payload.tweet?.text ??
    payload.tweet?.full_text ??
    payload.tweet?.content ??
    payload.text ??
    payload.content,
  )
}

function pickFxAuthor(payload: FxTwitterResponse): string | null {
  const nestedAuthor = payload.tweet?.author ?? payload.tweet?.user
  return compactText(
    nestedAuthor?.name ??
    nestedAuthor?.username ??
    nestedAuthor?.screen_name ??
    payload.author?.name ??
    payload.author?.username ??
    payload.author?.screen_name,
  )
}

function collectFxMediaItems(payload: FxTwitterResponse): FxTwitterMediaItem[] {
  const mediaRoot = payload.tweet?.media ?? payload.media
  if (!mediaRoot) return []

  if (Array.isArray(mediaRoot)) {
    return mediaRoot
  }

  const mediaGroups = [
    mediaRoot.all,
    mediaRoot.photos,
    mediaRoot.videos,
    mediaRoot.external,
  ]

  return mediaGroups.flatMap((group) => (Array.isArray(group) ? group : []))
}

function extractFxMedia(payload: FxTwitterResponse): ScrapedMedia {
  const mediaItems = collectFxMediaItems(payload)
  const imageCandidates: string[] = []
  const videoCandidates: string[] = []

  for (const item of mediaItems) {
    const type = item.type?.toLowerCase() ?? ''

    imageCandidates.push(
      item.media_url_https ?? '',
      item.media_url ?? '',
      item.image_url ?? '',
      item.thumbnail_url ?? '',
      item.poster ?? '',
      item.preview_image_url ?? '',
      item.preview_url ?? '',
    )

    if (item.url) {
      if (type === 'photo' || isLikelyImageUrl(item.url)) {
        imageCandidates.push(item.url)
      }

      if (type === 'video' || type === 'animated_gif' || isLikelyVideoUrl(item.url)) {
        videoCandidates.push(item.url)
      }
    }

    if (Array.isArray(item.variants)) {
      const variants = [...item.variants].sort(
        (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0),
      )

      for (const variant of variants) {
        const variantUrl = variant.url
        if (!variantUrl) continue

        if (variant.content_type?.includes('video') || isLikelyVideoUrl(variantUrl)) {
          videoCandidates.push(variantUrl)
        }
      }
    }
  }

  return {
    imageUrls: normalizeUrlList(imageCandidates),
    videoUrls: normalizeUrlList(videoCandidates),
  }
}

async function scrapeFromFxTwitter(
  tweetId: string,
  normalizedUrl: string,
): Promise<ScrapedTweet | null> {
  try {
    const endpoint = `https://api.fxtwitter.com/status/${tweetId}`
    const { data } = await axios.get<FxTwitterResponse>(endpoint, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    })

    const media = extractFxMedia(data)
    const content = buildContentWithMedia(pickFxText(data), media)
    if (!content) return null

    const author = pickFxAuthor(data)
    return {
      title: buildTitle(author, tweetId),
      content,
      imageUrl: firstImageUrl(media),
    }
  } catch (error) {
    console.warn(
      `⚠️ fxTwitter fallback failed for ${normalizedUrl}:`,
      (error as Error).message,
    )
    return null
  }
}

async function scrapeFromOEmbed(
  normalizedUrl: string,
  tweetId: string | null,
): Promise<ScrapedTweet | null> {
  try {
    const endpoint = `https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=${encodeURIComponent(normalizedUrl)}`
    const { data } = await axios.get<TwitterOEmbedResponse>(endpoint, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    })

    if (!data?.html) return null

    const { load } = await import('cheerio')
    const $ = load(data.html)
    const tweetText = compactText($('blockquote p').first().text() || $('p').first().text())

    const imageNodes = $('img')
      .map((_idx, element) => $(element).attr('src') || '')
      .get() as string[]

    const mediaFromHtml: ScrapedMedia = {
      imageUrls: normalizeUrlList([data.thumbnail_url, ...imageNodes]),
      videoUrls: [],
    }
    const mediaFromLinks = extractMediaFromText(data.html)
    const mergedMedia = mergeMedia(mediaFromHtml, mediaFromLinks)

    const content = buildContentWithMedia(tweetText, mergedMedia)
    if (!content) return null

    const author = compactText(data.author_name)

    return {
      title: buildTitle(author, tweetId),
      content,
      imageUrl: firstImageUrl(mergedMedia),
    }
  } catch (error) {
    console.warn(
      `⚠️ Twitter oEmbed fallback failed for ${normalizedUrl}:`,
      (error as Error).message,
    )
    return null
  }
}

async function scrapeFromJina(
  normalizedUrl: string,
  tweetId: string | null,
): Promise<ScrapedTweet | null> {
  try {
    const endpoint = `https://r.jina.ai/${normalizedUrl}`
    const { data } = await axios.get<string>(endpoint, {
      headers: { Accept: 'text/plain' },
      timeout: 12000,
    })

    if (typeof data !== 'string') return null

    const cleaned = data
      .replace(/^URL Source:\s.*$/gim, '')
      .replace(/^Markdown Content:\s*$/gim, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')

    const media = extractMediaFromText(cleaned)
    const textWithoutRawLinks = cleaned.replace(/https?:\/\/[^\s<>"')\]]+/g, ' ')
    const content = buildContentWithMedia(textWithoutRawLinks, media)
    if (!content) return null

    return {
      title: buildTitle(null, tweetId),
      content,
      imageUrl: firstImageUrl(media),
    }
  } catch (error) {
    console.warn(
      `⚠️ Jina fallback failed for ${normalizedUrl}:`,
      (error as Error).message,
    )
    return null
  }
}

export async function scrapeTweet(url: string): Promise<ScrapedTweet> {
  const normalizedUrl = normalizeTweetUrl(url)
  const tweetId = extractTweetId(normalizedUrl)

  try {
    if (tweetId) {
      const fxResult = await scrapeFromFxTwitter(tweetId, normalizedUrl)
      if (fxResult?.content || fxResult?.imageUrl) return fxResult
    }

    const oEmbedResult = await scrapeFromOEmbed(normalizedUrl, tweetId)
    if (oEmbedResult?.content || oEmbedResult?.imageUrl) return oEmbedResult

    const jinaResult = await scrapeFromJina(normalizedUrl, tweetId)
    if (jinaResult?.content || jinaResult?.imageUrl) return jinaResult

    return {
      title: buildTitle(null, tweetId),
      content: null,
      imageUrl: null,
    }
  } catch (error) {
    console.error(`Failed to scrape tweet at ${normalizedUrl}:`, error)
    return { title: null, content: null, imageUrl: null }
  }
}
