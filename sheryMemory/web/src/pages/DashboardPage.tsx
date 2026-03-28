import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { DashboardTab } from '../components/DashboardSidebar'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { MobileBottomTabBar } from '../components/MobileBottomTabBar'
import { useAuth } from '../features/auth/hooks/useAuth'
import { ChatPage } from '../features/chat/components/ChatPage'
import { CollectionsGrid } from '../features/collections/components/CollectionsGrid'
import { KnowledgeGraph } from '../features/graph/components/KnowledgeGraph'
import { ItemsGrid } from '../features/items/components/ItemsGrid'
import { SaveItemModal } from '../features/items/components/SaveItemModal'
import { useSemanticSearch } from '../features/items/hooks/useItems'
import { LibraryPage } from '../features/library/components/LibraryPage'
import { useResurfacedItems } from '../features/memory/hooks/useMemory'
import { useSocket } from '../hooks/useSocket'
import { HighlightsPage } from './HighlightsPage'

import {
  Bell,
  Moon,
  Network,
  Search,
  Sun,
  Wand2
} from 'lucide-react'
import { motion } from 'motion/react'

export default function DashboardPage() {
  const { user, isAuthenticated, isUserLoading } = useAuth()
  useSocket()
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: resurfacedItems } = useResurfacedItems()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    return (
      (localStorage.getItem('dashboard_active_tab') as DashboardTab) || 'home'
    )
  })
  const [feedFilter, setFeedFilter] = useState<'recent' | 'relevant'>('recent')

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const handleNotification = (e: any) => {
      setNotifications((prev) => [e.detail, ...prev])
    }
    window.addEventListener('memory:notification', handleNotification)
    return () => window.removeEventListener('memory:notification', handleNotification)
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { results: searchResults, isLoading: isSearchLoading } =
    useSemanticSearch(debouncedQuery, 5)

  useEffect(() => {
    localStorage.setItem('dashboard_active_tab', activeTab)
  }, [activeTab])

  const getFuzzyTime = (date: string | Date | undefined) => {
    if (!date) return 'Forgotten insight'
    const days = Math.round(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    )
    if (days === 0) return 'Added Today'
    if (days < 7) return `From ${days} days ago`
    if (days < 30) return `From ${Math.floor(days / 7)} weeks ago`
    return `From ${Math.floor(days / 30)} months ago`
  }

  if (isUserLoading) return null
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  return (
    <div className="font-body min-h-screen bg-(--bg-base) text-(--text-primary) selection:bg-(--accent)/20">
      {/* SideNavBar Anchor (desktop) */}
      <DashboardSidebar
        activeTab={activeTab}
        onChange={setActiveTab}
        onNewThought={() => setIsModalOpen(true)}
      />

      {/* MobileBottomTabBar (mobile only) */}
      <MobileBottomTabBar
        activeTab={activeTab}
        onChange={setActiveTab}
        onNewThought={() => setIsModalOpen(true)}
      />

      {/* TopNavBar Anchor */}
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
                    <button onClick={() => setNotifications([])} className="cursor-pointer text-[10px] text-(--text-muted) transition-colors hover:text-(--accent)">Clear All</button>
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
                          setShowNotifications(false);
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

      {/* Main Content Stage */}
      <main className="px-6 pt-24 pb-24 md:ml-56 md:px-10 md:pb-12">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            {/* Left Column: Knowledge Feed */}
            <section className="col-span-1 space-y-10 md:col-span-8">
              <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-(--text-secondary) uppercase">
                    Curation Stream
                  </span>
                  <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-(--text-primary)">
                    Main Feed
                  </h2>
                </div>
                <div className="relative flex gap-1 rounded-full w-fit border border-(--border-subtle) bg-(--bg-elevated) p-1">
                  {(['recent', 'relevant'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFeedFilter(tab)}
                      className={`relative z-10 cursor-pointer rounded-full px-6 py-2 text-xs font-bold transition-colors ${
                        feedFilter === tab
                          ? 'text-(--text-primary)'
                          : 'text-(--text-secondary) hover:text-(--text-primary)'
                      }`}
                    >
                      {feedFilter === tab && (
                        <motion.div
                          layoutId="activeFeedTab"
                          className="absolute inset-0 rounded-full border border-(--border-subtle) bg-(--bg-surface) shadow-sm"
                          transition={{
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-20 capitalize">{tab}</span>
                    </button>
                  ))}
                </div>
              </header>

              <ItemsGrid filter={feedFilter} />
            </section>

            {/* Right Column: Sidebar Widgets */}
            <aside className="col-span-1 space-y-8 md:col-span-4">
              {/* Daily Feed Widget */}
              <div className="rounded-3xl border border-(--border-subtle) bg-(--bg-surface) p-8 shadow-(--border-subtle)/30 shadow-xl">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="font-manrope text-lg font-bold text-(--text-primary)">
                    Daily Knowledge
                  </h3>
                  <Wand2 className="h-5 w-5 text-(--accent)" />
                </div>
                <div className="space-y-6">
                  {resurfacedItems?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="group relative cursor-pointer border-l-2 border-(--accent)/30 pl-6 transition-colors hover:border-(--accent)"
                    >
                      <span className="mb-1 block text-[10px] font-bold tracking-widest text-(--text-muted) uppercase">
                        {getFuzzyTime(item.createdAt)}
                      </span>
                      <p className="line-clamp-2 text-sm font-semibold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                        {item.title || item.url}
                      </p>
                    </div>
                  ))}
                  {(!resurfacedItems || resurfacedItems.length === 0) && (
                    <div className="text-sm text-(--text-secondary)">
                      Your memory engine is indexing. Save some items to launch
                      your knowledge resurfacer!
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ['memory'] })
                  }
                  className="mt-10 w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-3 text-xs font-bold tracking-widest text-(--text-secondary) uppercase transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                >
                  Shuffle Feed
                </button>
              </div>

              {/* Collections Teaser */}
              <div className="group relative overflow-hidden rounded-3xl bg-(--accent) p-8 text-(--text-on-accent) shadow-(--accent)/20 shadow-xl">
                <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-(--bg-base)/10 transition-transform duration-1000 group-hover:scale-150"></div>
                <Network className="mb-4 h-8 w-8 text-(--text-on-accent)" />
                <h3 className="font-manrope mb-2 text-xl font-bold">
                  Knowledge Graph
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-(--text-on-accent)/80">
                  You have multiple unconnected thoughts. Visualize
                  relationships now.
                </p>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="relative z-10 cursor-pointer rounded-xl bg-(--bg-base) px-6 py-2.5 text-xs font-bold tracking-wider text-(--accent) uppercase shadow-sm transition-colors hover:bg-(--bg-surface)"
                >
                  Open Graph
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Collections View */}
        {activeTab === 'collections' && <CollectionsGrid />}

        {/* Graph View */}
        {activeTab === 'graph' && (
          <div className="mx-auto min-h-[70vh] w-full max-w-7xl px-2 pt-8 pb-12 md:px-8">
            <KnowledgeGraph />
          </div>
        )}

        {/* Highlights View */}
        {activeTab === 'highlights' && <HighlightsPage />}

        {/* Library View */}
        {activeTab === 'library' && <LibraryPage />}

        {/* Chat View */}
        {activeTab === 'chat' && <ChatPage />}
      </main>



      <SaveItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
