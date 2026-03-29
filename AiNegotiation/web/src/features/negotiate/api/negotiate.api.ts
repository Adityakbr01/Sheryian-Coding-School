import { apiFetch, API_URL } from '../../../lib/api'
import type {
  NegotiationSession,
  NegotiateResponse,
  Product,
  Difficulty,
} from '../types/negotiate.types'

export type SSECallbacks = {
  onMeta: (meta: Omit<NegotiateResponse, 'reply'>) => void
  onChunk: (chunk: string) => void
  onDone: (result: { dealClosed: boolean; isWalkaway: boolean; reply: string }) => void
  onError: (msg: string) => void
}

export const negotiateApi = {
  listProducts: async (): Promise<{ data: Product[] }> => {
    return apiFetch('/sessions/products')
  },

  startSession: async (
    productId: string,
    difficulty: Difficulty,
  ): Promise<{ data: NegotiationSession }> => {
    return apiFetch('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ productId, difficulty }),
    })
  },

  getSession: async (sessionId: string): Promise<{ data: NegotiationSession }> => {
    return apiFetch(`/sessions/${sessionId}`)
  },

  getUserSessions: async (): Promise<{ data: NegotiationSession[] }> => {
    return apiFetch('/sessions/my')
  },

  /**
   * SSE-based negotiate — calls callbacks as events arrive.
   * Returns an AbortController so the caller can cancel mid-stream.
   */
  negotiate: (
    sessionId: string,
    message: string,
    callbacks: SSECallbacks,
    facialEmotion?: string,
  ): AbortController => {
    const controller = new AbortController()

    fetch(`${API_URL}/negotiate`, {
      method: 'POST',
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, message, facialEmotion }),
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        callbacks.onError('Request failed')
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // Process complete SSE lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (currentEvent === 'meta') callbacks.onMeta(data)
              else if (currentEvent === 'reply_chunk') callbacks.onChunk(data.chunk)
              else if (currentEvent === 'done') callbacks.onDone(data)
              else if (currentEvent === 'error') callbacks.onError(data.message ?? 'Unknown error')
            } catch { /* ignore parse errors */ }
            currentEvent = ''
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') callbacks.onError(err.message ?? 'Stream error')
    })

    return controller
  },

  acceptDeal: async (
    sessionId: string,
  ): Promise<{ data: { finalPrice: number; discount: number; totalRounds: number; tacticsUsed: string[]; moodHistory: string[] } }> => {
    return apiFetch(`/negotiate/${sessionId}/accept`, { method: 'POST' })
  },
}

