import { useEffect, useRef } from 'react'
import type { Message } from '../types/negotiate.types'
import { TacticBadge } from './TacticBadge'

interface Props {
  messages: Message[]
  isSending: boolean
  streamingReply?: string
  sellerName?: string
}

export function ChatWindow({ messages, isSending, streamingReply = '', sellerName = 'RajAI 🧑‍💼' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-1 py-2">
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-(--text-muted)">
          <span className="text-4xl">🏪</span>
          <p className="text-sm">Start the negotiation by sending a message!</p>
        </div>
      )}

      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user'
        return (
          <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className="text-xs text-(--text-muted)">
                {isUser ? 'You' : sellerName}
              </div>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser
                    ? 'rounded-tr-sm bg-(--accent) text-white'
                    : 'rounded-tl-sm bg-(--bg-elevated) text-(--text-primary)'
                  }`}
              >
                {msg.content}
              </div>
              {isUser && msg.tactic && (
                <TacticBadge tactic={msg.tactic} size="sm" />
              )}
              {msg.priceAtRound !== undefined && (
                <div className="text-xs text-(--text-muted)">
                  Price: ₹{msg.priceAtRound.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Streaming reply bubble — shows while chunks arrive */}
      {isSending && streamingReply && (
        <div className="flex justify-start">
          <div className="flex max-w-[80%] flex-col gap-1 items-start">
            <div className="text-xs text-(--text-muted)">{sellerName}</div>
            <div className="rounded-2xl rounded-tl-sm bg-(--bg-elevated) px-4 py-2.5 text-sm leading-relaxed text-(--text-primary)">
              {streamingReply}
              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current" />
            </div>
          </div>
        </div>
      )}

      {/* Loading dots — shows before first chunk arrives */}
      {isSending && !streamingReply && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-(--bg-elevated) px-4 py-2.5 text-sm text-(--text-muted)">
            <span className="inline-flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

