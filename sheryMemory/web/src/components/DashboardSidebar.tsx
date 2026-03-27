import appInfo from '@/constants/appInfo';
import { Home, FolderOpen, Network, BookOpen, Plus, HelpCircle, Settings, Brain, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export type DashboardTab = 'home' | 'collections' | 'graph' | 'highlights';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  onNewThought: () => void;
}

const NAV_ITEMS: { key: DashboardTab; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'collections', label: 'Collections', icon: FolderOpen },
  { key: 'graph', label: 'Graph View', icon: Network },
  { key: 'highlights', label: 'Highlights', icon: BookOpen },
];

export function DashboardSidebar({ activeTab, onChange, onNewThought }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleNav = (tab: DashboardTab) => {
    onChange(tab);
    setOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-md shadow-[var(--accent)]/20">
            <Brain className="w-5 h-5 text-[var(--text-on-accent)]" />
          </div>
          <div>
            <h1 className="font-manrope font-extrabold text-[var(--text-primary)] tracking-tight leading-none text-base">{appInfo.NAME}</h1>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mt-0.5">Digital Curator</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-[var(--bg-overlay)] text-[var(--text-muted)]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200 cursor-pointer group ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute inset-0 bg-[var(--accent)]/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] relative z-10 transition-colors ${isActive ? 'text-[var(--accent)]' : 'group-hover:text-[var(--text-primary)]'}`} />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* New Thought CTA */}
      <div className="px-4 py-3">
        <button
          onClick={() => { onNewThought(); setOpen(false); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-xl font-semibold text-sm shadow-lg shadow-[var(--accent)]/15 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Thought
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-overlay)] transition-colors cursor-pointer text-[13px]">
          <HelpCircle className="w-[18px] h-[18px]" />
          Help
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-overlay)] transition-colors cursor-pointer text-[13px]">
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-95 transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-in drawer, desktop: fixed */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-56 z-50
          bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]
          flex flex-col
          transition-transform duration-300 ease-out
          md:translate-x-0 md:shadow-none
          ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
