import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { DashboardTab } from '../components/DashboardSidebar';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { useAuth } from '../features/auth/hooks/useAuth';
import { CollectionsGrid } from '../features/collections/components/CollectionsGrid';
import { KnowledgeGraph } from '../features/graph/components/KnowledgeGraph';
import { ItemsGrid } from '../features/items/components/ItemsGrid';
import { SaveItemModal } from '../features/items/components/SaveItemModal';
import { useSemanticSearch } from '../features/items/hooks/useItems';
import { useResurfacedItems } from '../features/memory/hooks/useMemory';
import { useSocket } from '../hooks/useSocket';
import { HighlightsPage } from './HighlightsPage';

import {
  Bell,
  Moon,
  Network,
  Plus,
  Search,
  Sparkles,
  Sun,
  Wand2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const { user, isAuthenticated, isUserLoading } = useAuth();
  useSocket();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: resurfacedItems } = useResurfacedItems();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    return (localStorage.getItem('dashboard_active_tab') as DashboardTab) || 'home';
  });
  const [feedFilter, setFeedFilter] = useState<'recent' | 'relevant'>('recent');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { results: searchResults, isLoading: isSearchLoading } = useSemanticSearch(debouncedQuery, 5);

  useEffect(() => {
    localStorage.setItem('dashboard_active_tab', activeTab);
  }, [activeTab]);

  const getFuzzyTime = (date: string | Date | undefined) => {
    if (!date) return 'Forgotten insight';
    const days = Math.round((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Added Today';
    if (days < 7) return `From ${days} days ago`;
    if (days < 30) return `From ${Math.floor(days / 7)} weeks ago`;
    return `From ${Math.floor(days / 30)} months ago`;
  };

  if (isUserLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <div className="bg-[var(--bg-base)] font-body text-[var(--text-primary)] selection:bg-[var(--accent)]/20 min-h-screen">
      {/* SideNavBar Anchor */}
      <DashboardSidebar activeTab={activeTab} onChange={setActiveTab} onNewThought={() => setIsModalOpen(true)} />

      {/* TopNavBar Anchor */}
      <header className="fixed top-0 right-0 left-0 md:left-56 h-16 bg-[var(--bg-surface)]/80 backdrop-blur-xl z-30 px-6 md:px-10 flex justify-between items-center border-b border-[var(--border-subtle)]">
        <div className="flex items-center w-full max-w-xl">
          <div className="relative w-full group z-50">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-[var(--input-focus-border)] transition-all outline-none text-[var(--input-text)] placeholder-[var(--input-placeholder)] shadow-sm"
              placeholder="Search your collective consciousness..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setSearchQuery(''), 250)}
            />

            {/* Semantic Search Dropdown */}
            {(debouncedQuery || isSearchLoading) && searchQuery !== '' && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden py-2 max-h-[60vh] overflow-y-auto w-full md:w-[120%] lg:w-[150%]">
                {isSearchLoading ? (
                  <div className="flex items-center justify-center p-6 text-[var(--text-muted)]">
                    <Wand2 className="w-5 h-5 animate-pulse mr-3 text-[var(--accent)]" />
                    <span className="text-sm font-medium">Scanning memory vectors for "{debouncedQuery}"...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-[var(--border-subtle)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Semantic Matches</span>
                    </div>
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/items/${item.id}`)}
                        className="text-left px-5 py-4 hover:bg-[var(--bg-overlay)] transition-colors border-l-2 border-transparent hover:border-[var(--accent)] flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{item.title || item.url}</span>
                        {item.summary && <span className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{item.summary}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[var(--text-secondary)] text-sm">
                    No semantically related memories found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 ml-6">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors relative cursor-pointer md:block hidden">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors relative cursor-pointer md:block hidden">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--error-text)] rounded-full border-2 border-[var(--bg-surface)]"></span>
          </button>
          <button className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer md:block hidden">
            <Sparkles className="w-5 h-5" />
          </button>
          <div className="h-10 w-10 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] overflow-hidden ring-2 ring-[var(--bg-base)] shadow-sm flex items-center justify-center uppercase font-bold text-lg">
            {user.name?.[0] || user.email?.[0]}
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="md:ml-56 pt-24 pb-12 px-6 md:px-10">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Knowledge Feed */}
            <section className="col-span-1 md:col-span-8 space-y-10">
              <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 block">Curation Stream</span>
                  <h2 className="text-4xl font-manrope font-extrabold tracking-tight text-[var(--text-primary)]">Main Feed</h2>
                </div>
                <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-full border border-[var(--border-subtle)] relative">
                  {(['recent', 'relevant'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFeedFilter(tab)}
                      className={`relative px-6 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer z-10 ${feedFilter === tab ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                      {feedFilter === tab && (
                        <motion.div
                          layoutId="activeFeedTab"
                          className="absolute inset-0 bg-[var(--bg-surface)] rounded-full shadow-sm border border-[var(--border-subtle)]"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
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
            <aside className="col-span-1 md:col-span-4 space-y-8">
              {/* Daily Feed Widget */}
              <div className="bg-[var(--bg-surface)] rounded-3xl p-8 shadow-xl shadow-[var(--border-subtle)]/30 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-manrope font-bold text-[var(--text-primary)]">Daily Knowledge</h3>
                  <Wand2 className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="space-y-6">
                  {resurfacedItems?.map(item => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="relative pl-6 border-l-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors group cursor-pointer">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                        {getFuzzyTime(item.createdAt)}
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] line-clamp-2 transition-colors">
                        {item.title || item.url}
                      </p>
                    </div>
                  ))}
                  {(!resurfacedItems || resurfacedItems.length === 0) && (
                    <div className="text-sm text-[var(--text-secondary)]">Your memory engine is indexing. Save some items to launch your knowledge resurfacer!</div>
                  )}
                </div>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['memory'] })}
                  className="w-full mt-10 py-3 bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl font-bold text-xs hover:bg-[var(--bg-overlay)] transition-colors uppercase tracking-widest cursor-pointer border border-[var(--border-subtle)]">
                  Shuffle Feed
                </button>
              </div>

              {/* Collections Teaser */}
              <div className="bg-[var(--accent)] rounded-3xl p-8 text-[var(--text-on-accent)] relative overflow-hidden group shadow-xl shadow-[var(--accent)]/20">
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[var(--bg-base)]/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <Network className="w-8 h-8 mb-4 text-[var(--text-on-accent)]" />
                <h3 className="text-xl font-manrope font-bold mb-2">Knowledge Graph</h3>
                <p className="text-[var(--text-on-accent)]/80 text-sm mb-6 leading-relaxed">You have multiple unconnected thoughts. Visualize relationships now.</p>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="bg-[var(--bg-base)] text-[var(--accent)] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--bg-surface)] transition-colors cursor-pointer relative z-10 shadow-sm"
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
          <div className="w-full max-w-7xl mx-auto pt-8 px-2 md:px-8 pb-12 min-h-[70vh]">
            <KnowledgeGraph />
          </div>
        )}

        {/* Highlights View */}
        {activeTab === 'highlights' && <HighlightsPage />}

      </main>

      {/* Floating Action Context (FAB) */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <button onClick={() => setIsModalOpen(true)} className="w-14 h-14 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full flex items-center justify-center shadow-2xl shadow-[var(--accent)]/40 cursor-pointer">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <SaveItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
