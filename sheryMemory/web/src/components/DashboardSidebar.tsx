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
  Library,
  Sparkle,
  LogOut,
} from 'lucide-react'
import { motion } from 'motion/react'
import { SlideButton } from './SlideButton'
import { useAuth } from '../features/auth/hooks/useAuth'

export type DashboardTab =
  | 'home'
  | 'collections'
  | 'graph'
  | 'highlights'
  | 'library'
  | 'chat'

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
  { key: 'library', label: 'Library', icon: Library },
  { key: 'collections', label: 'Collections', icon: FolderOpen },
  { key: 'graph', label: 'Graph View', icon: Network },
  { key: 'highlights', label: 'Highlights', icon: BookOpen },
]

export function DashboardSidebar({
  activeTab,
  onChange,
  onNewThought,
}: DashboardSidebarProps) {
  const { logout: authLogout } = useAuth()

  const handleNav = (tab: DashboardTab) => {
    onChange(tab)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
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
      <div className="px-4 py-1">
        <SlideButton onClick={() => onNewThought()} fullWidth className="gap-2">
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> New Thought
          </div>
        </SlideButton>
      </div>

      {/* Find with AI */}
      <div className="px-4 py-1">
        <SlideButton
          onClick={() => onChange('chat')}
          variant="secondary"
          fullWidth
          className="gap-2 border-(--accent)/30 bg-(--accent)/10 text-(--accent) hover:bg-(--accent)/20"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkle className="h-4 w-4" /> Find with AI
          </div>
        </SlideButton>
      </div>

      {/* Footer */}
      <div className="space-y-0.5 px-3 pb-5">
        {/* Help Button */}
        <button
          disabled
          title="Coming soon"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:pointer-events-none disabled:cursor-default disabled:opacity-50"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          Help
        </button>

        {/* Settings Button */}
        <button
          disabled
          title="Coming soon"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:pointer-events-none disabled:cursor-default disabled:opacity-50"
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </button>
        {/* LogOut */}
        <div>
          <button
            onClick={() => authLogout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-red-500 transition-colors duration-200 hover:bg-red-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </div>
    </>
  )

  return (
    <aside className="fixed top-0 left-0 z-50 hidden h-full w-56 flex-col border-r border-(--border-subtle) bg-(--bg-surface) md:flex">
      {sidebarContent}
    </aside>
  )
}
