import { Navigate } from 'react-router-dom'
import { DashboardSidebar } from '../../../components/DashboardSidebar'
import { MobileBottomTabBar } from '../../../components/MobileBottomTabBar'
import { useAuth } from '../../auth/hooks/useAuth'
import { ChatPage } from '../../chat/pages/ChatPage'
import { CollectionsGrid } from '../../collections/components/CollectionsGrid'
import { KnowledgeGraph } from '../../graph/components/KnowledgeGraph'
import { SaveItemModal } from '../../items/components/SaveItemModal'
import { LibraryPage } from '../../library/components/LibraryPage'
import { useSocket } from '../../../hooks/useSocket'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardHeader } from '../components/DashboardHeader'
import { DashboardFeed } from '../components/DashboardFeed'
import { DashboardWidgets } from '../components/DashboardWidgets'
import { DashboardSkeleton } from '../components/DashboardSkeleton'
import HighlightsPage from '@/features/highlights'

export default function DashboardPage() {
  const { user, isAuthenticated, isUserLoading } = useAuth()
  useSocket()

  const {
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    feedFilter,
    setFeedFilter,
    notifications,
    showNotifications,
    setShowNotifications,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    isSearchLoading,
    resurfacedItems,
    clearNotifications,
    closeNotifications
  } = useDashboard()

  if (isUserLoading) return <DashboardSkeleton />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  return (
    <div className="font-body min-h-screen bg-(--bg-base) text-(--text-primary) selection:bg-(--accent)/20">
      <DashboardSidebar
        activeTab={activeTab}
        onChange={setActiveTab}
        onNewThought={() => setIsModalOpen(true)}
      />

      <MobileBottomTabBar
        activeTab={activeTab}
        onChange={setActiveTab}
        onNewThought={() => setIsModalOpen(true)}
      />

      <DashboardHeader
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchLoading={isSearchLoading}
        searchResults={searchResults}
        debouncedQuery={debouncedQuery}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        onClearNotifications={clearNotifications}
        onCloseNotifications={closeNotifications}
      />

      {/* Main Content Stage */}
      <main className="px-6 pt-24 pb-24 md:ml-56 md:px-10 md:pb-12">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <DashboardFeed filter={feedFilter} setFilter={setFeedFilter} />
            <DashboardWidgets
              resurfacedItems={resurfacedItems}
              onOpenGraph={() => setActiveTab('graph')}
            />
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
