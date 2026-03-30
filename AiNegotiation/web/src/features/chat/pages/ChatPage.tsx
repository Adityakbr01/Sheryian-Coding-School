import Cookies from 'js-cookie'
import {
  Bot,
  Check,
  Compass,
  Copy,
  History,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'

const API_URL = 'http://localhost:5000/api'
const getHeaders = () => {
  const token = Cookies.get('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: any[]
  createdAt: string
}

interface Session {
  id: string
  title: string
  updatedAt: string
}

export function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'search' | 'explore' | 'recall'>('search')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Session Management ──────────────────────────────────────────
  const loadSessions = async (selectLatest = false) => {
    try {
      const res = await fetch(`${API_URL}/chat/sessions`, {
        headers: getHeaders(),
      })
      const data = await res.json()
      const loaded = data?.data || []
      setSessions(loaded)

      if (selectLatest && loaded.length > 0) {
        setActiveSessionId(loaded[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    loadSessions(true)
  }, [])

  const loadMessages = async (sid: string) => {
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`${API_URL}/chat/sessions/${sid}/messages`, {
        headers: getHeaders(),
      })
      const data = await res.json()
      setMessages(data?.data || [])
    } catch (err) {
      console.error('Failed to load chat messages:', err)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const handleDeleteSession = async (sid: string) => {
    try {
      await fetch(`${API_URL}/chat/sessions/${sid}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (activeSessionId === sid) {
        setActiveSessionId(null)
        setMessages([])
      }
      loadSessions(false)
    } catch (err) {
      console.error('Failed to delete session', err)
    }
  }

  // ── Messaging ───────────────────────────────────────────────────
  const handleSend = async (overrideContent?: string, isRegenerate = false) => {
    const textToSend = overrideContent || input
    if (!textToSend.trim() || isSending) return

    let currentSessionId = activeSessionId

    // Auto-create session on first message if none active
    if (!currentSessionId && !isRegenerate) {
      try {
        const createRes = await fetch(`${API_URL}/chat/sessions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ title: textToSend.substring(0, 30) }),
        })
        const createResult = await createRes.json()
        currentSessionId = createResult?.data?.id
        setActiveSessionId(currentSessionId)
        loadSessions(false)
      } catch (e) {
        console.error('Failed to create session on first send:', e)
        return
      }
    }

    if (!currentSessionId) return

    if (!isRegenerate) {
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: textToSend,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
    } else {
      setMessages((prev) => {
        const newMsgs = [...prev]
        if (
          newMsgs.length > 0 &&
          newMsgs[newMsgs.length - 1].role === 'assistant'
        ) {
          newMsgs.pop()
        }
        return newMsgs
      })
    }

    setIsSending(true)

    try {
      const res = await fetch(
        `${API_URL}/chat/sessions/${currentSessionId}/stream`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            content: textToSend,
            mode,
            regenerate: isRegenerate,
          }),
        },
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message || errorData.error || 'Failed to connect to stream',
        )
      }

      setIsSending(false)
      const aiMessageId = Date.now().toString()
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ])

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream available')

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
              if (line.startsWith('event:'))
                eventType = line.substring(6).trim()
              if (line.startsWith('data:')) dataStr += line.substring(5).trim()
            }

            if (dataStr) {
              if (eventType === 'context') {
                const contextItems = JSON.parse(dataStr)
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId ? { ...m, context: contextItems } : m,
                  ),
                )
              } else if (eventType === 'message') {
                const data = JSON.parse(dataStr)
                assistantContent += data.content || ''
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: assistantContent }
                      : m,
                  ),
                )
              } else if (eventType === 'error') {
                const data = JSON.parse(dataStr)
                throw new Error(data.message)
              } else if (eventType === 'done') {
                const finalData = JSON.parse(dataStr)
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiMessageId ? finalData : m)),
                )
                // Refresh sessions to get the new LLM-generated title
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
        content: `Apologies, an error occurred: ${err.message || 'The AI service is unavailable.'} (This is often due to API rate limits).`,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSending(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--accent)" />
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-base) shadow-sm">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Sessions */}
      <div
        className={`absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-(--border-subtle) bg-(--bg-surface) transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--text-on-accent) shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-2 rounded-lg p-2 text-(--text-muted) hover:bg-(--bg-elevated) md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {sessions.map((s) => (
            <div key={s.id} className="group relative">
              <button
                onClick={() => {
                  setActiveSessionId(s.id)
                  if (window.innerWidth < 768) setIsSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                  activeSessionId === s.id
                    ? 'bg-(--accent)/10 font-semibold text-(--accent) shadow-sm ring-1 ring-(--accent)/20'
                    : 'text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary)'
                }`}
              >
                <MessageSquare
                  className={`h-4 w-4 shrink-0 ${activeSessionId === s.id ? 'text-(--accent)' : 'text-(--text-muted)'}`}
                />
                <span className="flex-1 truncate text-left">
                  {s.title || 'New Conversation'}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSession(s.id)
                }}
                title="Delete Chat"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-(--text-muted)">
              No chat history. Start a new conversation!
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-(--bg-base)">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-(--border-subtle) bg-(--bg-elevated) p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-(--text-muted) hover:bg-(--bg-surface) hover:text-(--text-primary) md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent)/10 ring-1 ring-(--accent)/20">
              <Sparkles className="h-5 w-5 text-(--accent)" />
            </div>
            <div>
              <h2 className="font-manrope text-lg font-bold text-(--text-primary)">
                AI Memory Assistant
              </h2>
              <p className="text-xs text-(--text-muted)">
                Chat with your collective knowledge
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-6">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-(--accent)" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--bg-elevated) shadow-sm ring-1 ring-(--border-subtle)">
                <Bot className="h-8 w-8 text-(--text-muted)" />
              </div>
              <h3 className="font-manrope text-xl font-bold tracking-tight text-(--text-primary)">
                How can I assist you today?
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-(--text-secondary)">
                Ask me anything about the content, links, documents, and notes
                you've saved to your memory engine.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[90%] gap-3 md:max-w-[85%] md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-inset ${
                        msg.role === 'user'
                          ? 'bg-(--accent) text-(--text-on-accent) ring-(--accent)'
                          : 'bg-(--bg-elevated) text-(--accent) ring-(--border-subtle)'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="flex w-full min-w-0 flex-col gap-2">
                      <div
                        className={`overflow-hidden rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-(--accent) text-(--text-on-accent)'
                            : 'rounded-tl-sm border border-(--border-subtle) bg-(--bg-elevated) text-(--text-primary)'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="chat-markdown max-w-none overflow-hidden text-[15px] leading-relaxed break-words">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* Context/Sources Metadata */}
                      {msg.context && msg.context.length > 0 && (
                        <div
                          className={`mt-1 flex flex-col gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-base) p-3 shadow-sm ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                        >
                          <span className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                            <Sparkles className="h-3 w-3" /> Sources Cited
                          </span>
                          <div className="flex flex-col gap-2">
                            {msg.context.map((src: any, idx: number) => {
                              const matchPct = src.final_score
                                ? Math.min(
                                    Math.round(src.final_score * 100),
                                    100,
                                  )
                                : 'N/A'
                              return (
                                <Link
                                  to={`/items/${src.id}`}
                                  key={idx}
                                  className="group flex flex-wrap items-center justify-between gap-3 rounded-lg bg-(--bg-surface) p-2.5 text-xs ring-1 ring-(--border-subtle) transition-all hover:bg-(--bg-elevated) hover:shadow-sm hover:ring-(--accent)/50"
                                >
                                  <span className="line-clamp-1 max-w-[200px] font-semibold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                                    {src.title || src.url}
                                  </span>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className="rounded-md bg-(--accent)/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-(--accent)">
                                      {matchPct}% Match
                                    </span>
                                    <span className="rounded-md bg-(--bg-overlay) px-1.5 py-0.5 text-[10px] font-medium text-(--text-secondary) capitalize">
                                      {src.type}
                                    </span>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Bar for AI */}
                      {msg.role === 'assistant' && (
                        <div className="mt-1 flex items-center gap-2 px-1">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-(--text-muted) transition-colors hover:text-(--text-primary)"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            {copiedId === msg.id ? 'Copied!' : 'Copy'}
                          </button>

                          {index === messages.length - 1 && (
                            <button
                              onClick={() => {
                                const lastUser = [...messages]
                                  .reverse()
                                  .find((m) => m.role === 'user')
                                if (lastUser) {
                                  handleSend(lastUser.content, true)
                                }
                              }}
                              className="ml-2 flex items-center gap-1.5 text-[11px] font-medium text-(--text-muted) transition-colors hover:text-(--text-primary)"
                              disabled={isSending}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Regenerate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[90%] gap-3 md:max-w-[85%] md:gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-elevated) text-(--accent) shadow-sm ring-1 ring-(--border-subtle) ring-inset">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-(--border-subtle) bg-(--bg-elevated) px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-1.5 px-1">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-(--accent)"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-(--accent)"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-(--accent)"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} className="h-2" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex shrink-0 flex-col items-center border-t border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="mb-3 flex w-full max-w-4xl items-end justify-between px-2">
            <span className="hidden text-xs font-semibold tracking-wider text-(--text-muted) uppercase sm:inline-block">
              AI mode
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-(--bg-elevated) p-1 shadow-sm ring-1 ring-(--border-subtle)">
              <button
                onClick={() => setMode('search')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${mode === 'search' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-primary)'}`}
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
              <button
                onClick={() => setMode('explore')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${mode === 'explore' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-primary)'}`}
              >
                <Compass className="h-3.5 w-3.5" /> Explore
              </button>
              <button
                onClick={() => setMode('recall')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${mode === 'recall' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-primary)'}`}
              >
                <History className="h-3.5 w-3.5" /> Recall
              </button>
            </div>
          </div>

          <div className="relative flex w-full max-w-4xl items-center rounded-2xl shadow-sm">
            <input
              type="text"
              className="w-full rounded-2xl border border-(--border-subtle) bg-(--bg-surface) py-3.5 pr-14 pl-5 text-[15px] text-(--text-primary) placeholder-(--text-muted) transition-all outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent)"
              placeholder="Message your AI Assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              disabled={isInitializing || isSending}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isInitializing || isSending}
              className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent) text-(--text-on-accent) shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2.5 text-center">
            <span className="text-[10px] text-(--text-muted)">
              AI can make mistakes. Verify important information using the
              provided sources.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
