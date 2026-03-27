import { useState } from 'react'

export type SidebarItem = 'overview' | 'items' | 'collections'

interface SidebarProps {
  activeTab: SidebarItem
  onChange: (tab: SidebarItem) => void
}

export function Sidebar({ activeTab, onChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'items', label: 'All Memories', icon: '📝' },
    { id: 'collections', label: 'Collections', icon: '📁' },
  ] as const

  return (
    <>
      {/* Mobile Toggle */}
      <div className="mb-6 w-full border-b border-(--border-subtle) pb-4 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3 font-medium text-(--text-primary) transition-colors hover:bg-(--border-subtle)"
        >
          <span className="text-xl leading-none">{isOpen ? '✕' : '☰'}</span>
          <span>{isOpen ? 'Close Navigation' : 'Open Navigation'}</span>
        </button>
      </div>

      <aside
        className={`w-full flex-shrink-0 flex-col md:flex md:w-64 ${isOpen ? 'flex' : 'hidden'} mb-8 gap-2 md:mb-0 md:pr-8`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onChange(tab.id)
              setIsOpen(false)
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left font-medium transition-all ${
              activeTab === tab.id
                ? 'border border-(--accent)/30 bg-(--accent)/10 text-(--accent) shadow-(--accent)/5 shadow-sm'
                : 'border border-transparent text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary)'
            }`}
          >
            <span className="text-2xl drop-shadow-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </aside>
    </>
  )
}
