import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { User, Bot, Sparkles, Copy, Check, RotateCcw } from 'lucide-react'
import type { Message } from '../types/chat.types'
import { useState } from 'react'

interface ChatMessageProps {
  message: Message
  isLast: boolean
  isSending: boolean
  onRegenerate: (content: string) => void
}

export function ChatMessage({ message, isLast, isSending, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>

        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-inset ${message.role === 'user'
            ? 'bg-(--accent) text-(--text-on-accent) ring-(--accent)'
            : 'bg-(--bg-elevated) text-(--accent) ring-(--border-subtle)'
            }`}
        >
          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-2 min-w-0 w-full">
          <div
            className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm overflow-hidden ${message.role === 'user'
              ? 'bg-(--accent) text-(--text-on-accent) rounded-tr-sm'
              : 'border border-(--border-subtle) bg-(--bg-elevated) text-(--text-primary) rounded-tl-sm'
              }`}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
            ) : (
              <div className="chat-markdown text-[15px] max-w-none wrap-break-word leading-relaxed overflow-hidden">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Context/Sources Metadata */}
          {message.context && message.context.length > 0 && (
            <div className={`mt-1 flex flex-col gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-base) p-3 shadow-sm ${message.role === 'user' ? 'self-end' : 'self-start'}`}>
              <span className="text-[10px] font-bold tracking-widest text-(--text-muted) uppercase ml-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Sources Cited
              </span>
              <div className="flex flex-col gap-2">
                {message.context.map((src: any, idx: number) => {
                  const matchPct = src.final_score
                    ? Math.min(Math.round(src.final_score * 100), 100)
                    : 'N/A';
                  return (
                    <Link
                      to={`/items/${src.id}`}
                      key={idx}
                      className="group flex flex-wrap items-center justify-between gap-3 rounded-lg bg-(--bg-surface) p-2.5 text-xs ring-1 ring-(--border-subtle) transition-all hover:bg-(--bg-elevated) hover:ring-(--accent)/50 hover:shadow-sm"
                    >
                      <span className="font-semibold text-(--text-primary) line-clamp-1 max-w-[200px] transition-colors group-hover:text-(--accent)">
                        {src.title || src.url}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
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
          {message.role === 'assistant' && (
            <div className="flex items-center gap-2 mt-1 px-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {isLast && (
                <button
                  onClick={() => onRegenerate(message.content)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors ml-2"
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
  )
}
