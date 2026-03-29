import { Search, Compass, History, Send } from 'lucide-react'
import type { ChatMode } from '../types/chat.types'

interface ChatInputProps {
  input: string
  setInput: (val: string) => void
  onSend: () => void
  mode: ChatMode
  setMode: (mode: ChatMode) => void
  disabled: boolean
}

export function ChatInput({
  input,
  setInput,
  onSend,
  mode,
  setMode,
  disabled
}: ChatInputProps) {
  return (
    <div className="border-t border-(--border-subtle) bg-(--bg-base) p-4 shrink-0 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-end mb-3 px-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) hidden sm:inline-block">AI mode</span>
        <div className="flex gap-1 rounded-xl bg-(--bg-elevated) p-1 shadow-sm ring-1 ring-(--border-subtle) items-center">
          <button onClick={() => setMode('search')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'search' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-surface)'}`}>
            <Search className="h-3.5 w-3.5" /> Search
          </button>
          <button onClick={() => setMode('explore')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'explore' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-surface)'}`}>
            <Compass className="h-3.5 w-3.5" /> Explore
          </button>
          <button onClick={() => setMode('recall')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'recall' ? 'bg-(--accent) text-(--text-on-accent) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-surface)'}`}>
            <History className="h-3.5 w-3.5" /> Recall
          </button>
        </div>
      </div>

      <div className="relative flex w-full max-w-4xl items-center shadow-sm rounded-2xl">
        <input
          type="text"
          className="w-full rounded-2xl border border-(--border-subtle) bg-(--bg-surface) py-3.5 pr-14 pl-5 text-[15px] text-(--text-primary) placeholder-(--text-muted) outline-none transition-all focus:border-(--accent) focus:ring-1 focus:ring-(--accent)"
          placeholder="Message your AI Assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend()
          }}
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || disabled}
          className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent) text-(--text-on-accent) transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <div className="text-center mt-2.5">
        <span className="text-[10px] text-(--text-muted)">AI can make mistakes. Verify important information using the provided sources.</span>
      </div>
    </div>
  )
}
