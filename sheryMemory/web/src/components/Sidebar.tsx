import { useState } from 'react';

export type SidebarItem = 'overview' | 'items' | 'collections';

interface SidebarProps {
  activeTab: SidebarItem;
  onChange: (tab: SidebarItem) => void;
}

export function Sidebar({ activeTab, onChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'items', label: 'All Memories', icon: '📝' },
    { id: 'collections', label: 'Collections', icon: '📁' },
  ] as const;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden pb-4 border-b border-[var(--border-subtle)] mb-6 w-full">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-[var(--text-primary)] font-medium p-3 bg-[var(--bg-elevated)] rounded-lg w-full border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
        >
          <span className="text-xl leading-none">{isOpen ? '✕' : '☰'}</span> 
          <span>{isOpen ? 'Close Navigation' : 'Open Navigation'}</span>
        </button>
      </div>

      <aside className={`md:flex flex-col w-full md:w-64 flex-shrink-0 ${isOpen ? 'flex' : 'hidden'} gap-2 mb-8 md:mb-0 md:pr-8`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onChange(tab.id);
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[var(--accent)]/5 shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'
            }`}
          >
            <span className="text-2xl drop-shadow-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </aside>
    </>
  );
}
