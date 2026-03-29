import { X, Plus, MessageSquare, Trash2 } from 'lucide-react'
import type { Session } from '../types/chat.types'

interface ChatSidebarProps {
  sessions: Session[]
  activeSessionId: string | null
  setActiveSessionId: (sid: string | null) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  onNewChat: () => void
  onDeleteSession: (sid: string) => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  isSidebarOpen,
  setIsSidebarOpen,
  onNewChat,
  onDeleteSession
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="absolute inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Sessions */}
      <div className={`absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-(--border-subtle) bg-(--bg-surface) transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-(--border-subtle)">
          <button onClick={onNewChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--text-on-accent) transition-transform hover:scale-[1.02] active:scale-95 shadow-sm">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-2 rounded-lg p-2 text-(--text-muted) hover:bg-(--bg-elevated) md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {sessions.map(s => (
            <div key={s.id} className="group relative">
              <button
                onClick={() => { setActiveSessionId(s.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${activeSessionId === s.id
                  ? 'bg-(--accent)/10 text-(--accent) font-semibold shadow-sm ring-1 ring-(--accent)/20'
                  : 'text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary)'
                  }`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${activeSessionId === s.id ? 'text-(--accent)' : 'text-(--text-muted)'}`} />
                <span className="truncate flex-1 text-left">{s.title || 'New Conversation'}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                title="Delete Chat"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center px-4 py-8 text-sm text-(--text-muted)">
              No chat history. Start a new conversation!
            </div>
          )}
        </div>
      </div>
    </>
  )
}
