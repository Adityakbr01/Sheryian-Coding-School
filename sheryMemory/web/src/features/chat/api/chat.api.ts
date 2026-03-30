import Cookies from 'js-cookie'
import type { Session, Message, ChatMode } from '../types/chat.types'
import { API_URL } from '@/constants/api'

const getHeaders = () => {
  const token = Cookies.get('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

export const ChatApi = {
  async getSessions(): Promise<Session[]> {
    const res = await fetch(`${API_URL}/chat/sessions`, { headers: getHeaders() })
    const data = await res.json()
    return data?.data || []
  },

  async createSession(title: string): Promise<Session> {
    const res = await fetch(`${API_URL}/chat/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title })
    })
    const data = await res.json()
    return data?.data
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, { headers: getHeaders() })
    const data = await res.json()
    return data?.data || []
  },

  async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  },

  async postToStream(sessionId: string, params: { content: string; mode: ChatMode; regenerate?: boolean }): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/stream`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Failed to connect to stream')
    }

    if (!res.body) throw new Error('No stream available')
    return res.body
  }
}
