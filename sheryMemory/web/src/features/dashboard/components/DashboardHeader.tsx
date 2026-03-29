import { Search, Wand2, Moon, Sun, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import type { DashboardNotification } from '../types/dashboard.types'

interface DashboardHeaderProps {
  user: any
  searchQuery: string
  setSearchQuery: (q: string) => void
  isSearchLoading: boolean
  searchResults: any[]
  debouncedQuery: string
  notifications: DashboardNotification[]
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  onClearNotifications: () => void
  onCloseNotifications: () => void
}

export function DashboardHeader({
  user,
  searchQuery,
  setSearchQuery,
  isSearchLoading,
  searchResults,
  debouncedQuery,
  notifications,
  showNotifications,
  setShowNotifications,
  onClearNotifications,
  onCloseNotifications
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-(--border-subtle) bg-(--bg-surface)/80 px-6 backdrop-blur-xl md:left-56 md:px-10">
      <div className="flex w-full max-w-xl items-center">
        <div className="group relative z-50 w-full">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-(--accent)" />
          <input
            className="w-full rounded-2xl border border-(--input-border) bg-(--input-bg) py-2.5 pr-4 pl-12 text-sm text-(--input-text) placeholder-(--input-placeholder) shadow-sm transition-all outline-none focus:border-(--input-focus-border) focus:ring-2 focus:ring-(--input-focus-ring)"
            placeholder="Search your collective consciousness..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setSearchQuery(''), 250)}
          />

          {/* Semantic Search Dropdown */}
          {(debouncedQuery || isSearchLoading) && searchQuery !== '' && (
            <div className="absolute top-full right-0 left-0 mt-2 max-h-[60vh] w-full overflow-hidden overflow-y-auto rounded-2xl border border-(--border-subtle) bg-(--bg-surface) py-2 shadow-2xl md:w-[120%] lg:w-[150%]">
              {isSearchLoading ? (
                <div className="flex items-center justify-center p-6 text-(--text-muted)">
                  <Wand2 className="mr-3 h-5 w-5 animate-pulse text-(--accent)" />
                  <span className="text-sm font-medium">
                    Scanning memory vectors for "{debouncedQuery}"...
                  </span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-2">
                    <span className="text-[10px] font-bold tracking-wider text-(--accent) uppercase">
                      Semantic Matches
                    </span>
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="flex cursor-pointer flex-col gap-1 border-l-2 border-transparent px-5 py-4 text-left transition-colors hover:border-(--accent) hover:bg-(--bg-overlay)"
                    >
                      <span className="line-clamp-1 text-sm font-semibold text-(--text-primary)">
                        {item.title || item.url}
                      </span>
                      {item.summary && (
                        <span className="mt-1 line-clamp-2 text-xs text-(--text-secondary)">
                          {item.summary}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-(--text-secondary)">
                  No semantically related memories found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="ml-6 flex items-center gap-6">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative hidden cursor-pointer text-(--text-secondary) transition-colors hover:text-(--accent) md:block"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative hidden cursor-pointer text-(--text-secondary) transition-colors hover:text-(--accent) md:block"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-(--bg-surface) bg-(--accent)"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-80 overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-surface) py-2 shadow-2xl">
              <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-2">
                <span className="text-[10px] font-bold tracking-wider text-(--accent) uppercase">Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={onClearNotifications} className="cursor-pointer text-[10px] text-(--text-muted) transition-colors hover:text-(--accent)">Clear All</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-(--text-muted)">No new notifications</div>
                ) : (
                  notifications.map((notif, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onCloseNotifications();
                        navigate(`/items/${notif.item?.id}`);
                      }}
                      className="flex w-full cursor-pointer flex-col gap-1 border-b border-(--border-subtle) px-4 py-3 text-left transition-colors hover:bg-(--bg-overlay) last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🧠</span>
                        <span className="text-xs font-semibold text-(--text-primary)">Memory Surfaced</span>
                      </div>
                      <span className="text-xs text-(--text-secondary)">{notif.message}</span>
                      <span className="line-clamp-1 text-xs font-medium text-(--accent)">{notif.item?.title || notif.item?.url}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-(--accent) text-lg font-bold text-(--text-on-accent) uppercase shadow-sm ring-2 ring-(--bg-base)">
          {user.name?.[0] || user.email?.[0]}
        </div>
      </div>
    </header>
  )
}
