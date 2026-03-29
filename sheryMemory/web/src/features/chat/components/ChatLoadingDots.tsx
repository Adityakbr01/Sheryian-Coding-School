import { Bot } from 'lucide-react'

export function ChatLoadingDots() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[90%] md:max-w-[85%] gap-3 md:gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-elevated) text-(--accent) shadow-sm ring-1 ring-(--border-subtle) ring-inset">
          <Bot className="h-4 w-4" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-(--border-subtle) bg-(--bg-elevated) px-5 py-4 shadow-sm">
          <div className="flex gap-1.5 items-center px-1">
            <div className="w-2 h-2 rounded-full bg-(--accent) animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-(--accent) animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-(--accent) animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
