import { Menu, Sparkles } from 'lucide-react'

interface ChatHeaderProps {
  onOpenSidebar: () => void
}

export function ChatHeader({ onOpenSidebar }: ChatHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-(--border-subtle) bg-(--bg-elevated) p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <button onClick={onOpenSidebar} className="rounded-lg p-2 text-(--text-muted) hover:bg-(--bg-surface) hover:text-(--text-primary) md:hidden">
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
  )
}
