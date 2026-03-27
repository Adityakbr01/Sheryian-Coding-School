import appInfo from '@/constants/appInfo'
import {
  Home,
  FolderOpen,
  Network,
  BookOpen,
  Plus,
  HelpCircle,
  Settings,
  Brain,
  Menu,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

export type DashboardTab = 'home' | 'collections' | 'graph' | 'highlights'

interface DashboardSidebarProps {
  activeTab: DashboardTab
  onChange: (tab: DashboardTab) => void
  onNewThought: () => void
}

const NAV_ITEMS: {
  key: DashboardTab
  label: string
  icon: React.ElementType
}[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'collections', label: 'Collections', icon: FolderOpen },
  { key: 'graph', label: 'Graph View', icon: Network },
  { key: 'highlights', label: 'Highlights', icon: BookOpen },
]

export function DashboardSidebar({
  activeTab,
  onChange,
  onNewThought,
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)

  const handleNav = (tab: DashboardTab) => {
    onChange(tab)
    setOpen(false)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent) shadow-(--accent)/20 shadow-md">
            <Brain className="h-5 w-5 text-(--text-on-accent)" />
          </div>
          <div>
            <h1 className="font-manrope text-base leading-none font-extrabold tracking-tight text-(--text-primary)">
              {appInfo.NAME}
            </h1>
            <p className="mt-0.5 text-[9px] tracking-[0.15em] text-(--text-muted) uppercase">
              Digital Curator
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-(--text-muted) hover:bg-(--bg-overlay) md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-(--accent)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute inset-0 rounded-xl bg-(--accent)/10"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon
                className={`relative z-10 h-[18px] w-[18px] transition-colors ${isActive ? 'text-(--accent)' : 'group-hover:text-(--text-primary)'}`}
              />
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* New Thought CTA */}
      <div className="px-4 py-3">
        <button
          onClick={() => {
            onNewThought()
            setOpen(false)
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) py-2.5 text-sm font-semibold text-(--text-on-accent) shadow-(--accent)/15 shadow-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Thought
        </button>
      </div>

      {/* Footer */}
      <div className="space-y-0.5 px-3 pb-5">
        <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-(--text-muted) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)">
          <HelpCircle className="h-[18px] w-[18px]" />
          Help
        </button>
        <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-(--text-muted) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)">
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-2 text-(--text-primary) shadow-lg transition-all hover:bg-(--bg-elevated) active:scale-95 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
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
        className={`fixed top-0 left-0 z-50 flex h-full w-56 flex-col border-r border-(--border-subtle) bg-(--bg-surface) transition-transform duration-300 ease-out md:translate-x-0 md:shadow-none ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
