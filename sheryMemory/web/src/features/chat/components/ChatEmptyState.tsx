import { Bot } from 'lucide-react'

export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--bg-elevated) shadow-sm ring-1 ring-(--border-subtle)">
        <Bot className="h-8 w-8 text-(--text-muted)" />
      </div>
      <h3 className="font-manrope text-xl font-bold tracking-tight text-(--text-primary)">How can I assist you today?</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-(--text-secondary)">Ask me anything about the content, links, documents, and notes you've saved to your memory engine.</p>
    </div>
  )
}
