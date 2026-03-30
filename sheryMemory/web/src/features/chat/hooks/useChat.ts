import { useCallback, useEffect, useState } from 'react'
import { ChatApi } from '../api/chat.api'
import type { ChatMode, Message, Session } from '../types/chat.types'

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ChatMode>('search')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const loadSessions = useCallback(async (selectLatest = false) => {
    try {
      const loaded = await ChatApi.getSessions()
      setSessions(loaded)

      if (selectLatest && loaded.length > 0) {
        setActiveSessionId(loaded[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  const loadMessages = useCallback(async (sid: string) => {
    setIsLoadingMessages(true)
    try {
      const loaded = await ChatApi.getMessages(sid)
      setMessages(loaded)
    } catch (err) {
      console.error('Failed to load chat messages:', err)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    loadSessions(true)
  }, [loadSessions])

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId, loadMessages])

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null)
    setMessages([])
  }, [])

  const handleDeleteSession = useCallback(async (sid: string) => {
    try {
      await ChatApi.deleteSession(sid)
      if (activeSessionId === sid) {
        setActiveSessionId(null)
        setMessages([])
      }
      loadSessions(false)
    } catch (err) {
      console.error('Failed to delete session', err)
    }
  }, [activeSessionId, loadSessions])

  const handleSend = useCallback(async (overrideContent?: string, isRegenerate = false) => {
    const textToSend = overrideContent || input;
    if (!textToSend.trim() || isSending) return

    let currentSessionId = activeSessionId

    if (!currentSessionId && !isRegenerate) {
      try {
        const createdSession = await ChatApi.createSession(textToSend.substring(0, 30))
        currentSessionId = createdSession.id
        setActiveSessionId(currentSessionId)
        loadSessions(false)
      } catch (e) {
        console.error('Failed to create session on first send:', e)
        return
      }
    }

    if (!currentSessionId) return

    if (!isRegenerate) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        createdAt: new Date().toISOString()
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
    } else {
      setMessages(prev => {
        const newMsgs = [...prev]
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
          newMsgs.pop()
        }
        return newMsgs
      })
    }

    setIsSending(true)

    try {
      const stream = await ChatApi.postToStream(currentSessionId, { content: textToSend, mode, regenerate: isRegenerate })

      setIsSending(false)
      const aiMessageId = Date.now().toString()
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      }])

      const reader = stream.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let buffer = ''
      let assistantContent = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''

          for (const part of parts) {
            const lines = part.split('\n')
            let eventType = 'message'
            let dataStr = ''

            for (const line of lines) {
              if (line.startsWith('event:')) eventType = line.substring(6).trim()
              if (line.startsWith('data:')) dataStr += line.substring(5).trim()
            }

            if (dataStr) {
              if (eventType === 'context') {
                const contextItems = JSON.parse(dataStr)
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, context: contextItems } : m))
              } else if (eventType === 'message') {
                const data = JSON.parse(dataStr)
                assistantContent += data.content || ''
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: assistantContent } : m))
              } else if (eventType === 'error') {
                const data = JSON.parse(dataStr)
                throw new Error(data.message)
              } else if (eventType === 'done') {
                const finalData = JSON.parse(dataStr)
                setMessages(prev => prev.map(m => m.id === aiMessageId ? finalData : m))
                loadSessions(false)
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to stream message:', err)
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Apologies, an error occurred: ${err.message || 'The AI service is unavailable.'}`,
        createdAt: new Date().toISOString()
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSending(false)
    }
  }, [activeSessionId, input, isSending, loadSessions, mode])

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    input,
    setInput,
    mode,
    setMode,
    isSending,
    isLoadingMessages,
    isInitializing,
    handleNewChat,
    handleDeleteSession,
    handleSend
  }
}
