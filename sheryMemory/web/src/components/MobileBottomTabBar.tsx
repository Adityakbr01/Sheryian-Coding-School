import {
  BookOpen,
  FolderOpen,
  Home,
  Library,
  Network,
  Plus,
  Sparkle,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import type { DashboardTab } from './DashboardSidebar'

interface MobileBottomTabBarProps {
  activeTab: DashboardTab
  onChange: (tab: DashboardTab) => void
  onNewThought: () => void
}

const TAB_ITEMS: {
  key: DashboardTab | 'create'
  icon: React.ElementType
  label: string
}[] = [
    { key: 'home', icon: Home, label: 'Home' },
    { key: 'library', icon: Library, label: 'Library' },
    { key: 'create', icon: Plus, label: 'New' },
    { key: 'graph', icon: Network, label: 'Graph' },
    { key: 'chat', icon: Sparkle, label: 'AI' },
  ]

const MORE_ITEMS: {
  key: DashboardTab
  icon: React.ElementType
  label: string
}[] = [
    { key: 'collections', icon: FolderOpen, label: 'Vault' },
    { key: 'highlights', icon: BookOpen, label: 'Highlights' },
  ]

export function MobileBottomTabBar({
  activeTab,
  onChange,
  onNewThought,
}: MobileBottomTabBarProps) {
  const { trigger } = useWebHaptics()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleTabPress = (tabKey: DashboardTab | 'create') => {
    if (tabKey === 'create') {
      trigger([{ duration: 25, intensity: 1 }])
      setIsDrawerOpen(false)
      onNewThought()
      return
    }
    if (tabKey === activeTab) return
    trigger([
      { duration: 15, intensity: 0.6 },
      { delay: 30, duration: 10, intensity: 1 },
    ])
    onChange(tabKey as DashboardTab)
    setIsDrawerOpen(false)
  }

  return (
    <>
      {/* ── Bottom Bar ───────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Top Gradient Overlay for smooth scroll fade */}
        <div
          className="pointer-events-none absolute -top-16 left-0 right-0 h-16
               bg-linear-to-t from-(--bg-surface)/90 to-transparent"
        />

        {/* 🔥 NAVBAR */}
        <div
          className="relative flex h-[60px] items-end justify-around
               bg-(--bg-surface)/90 backdrop-blur-xl
               pb-[max(10px,env(safe-area-inset-bottom))]"
        >
          {TAB_ITEMS.map(({ key, icon: Icon, label }) => {

            /* ── Center FAB ───────────────────────── */
            if (key === 'create') {
              return (
                <motion.button
                  key="create"
                  onClick={() => handleTabPress('create')}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className="flex flex-col items-center justify-center gap-[3px] outline-none"
                  aria-label="New Thought"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div
                    className="flex h-[34px] w-[34px] items-center justify-center
                         rounded-full bg-(--text-primary)"
                  >
                    <Plus
                      style={{
                        width: 16,
                        height: 16,
                        color: 'var(--bg-base)',
                        strokeWidth: 2.8,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium leading-none"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {label}
                  </span>
                </motion.button>
              )
            }

            /* ── Regular Tab ───────────────────────── */
            const isActive = activeTab === (key as DashboardTab)

            return (
              <motion.button
                key={key}
                onClick={() => handleTabPress(key)}
                whileTap={{ scale: 0.84 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="flex flex-col items-center justify-center gap-[3px] outline-none"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <motion.div
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <Icon
                    style={{
                      width: 20,
                      height: 20,
                      color: isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                      strokeWidth: isActive ? 2.2 : 1.8,
                      transition: 'color 0.15s',
                    }}
                  />
                </motion.div>

                <span
                  className="text-[10px] font-medium leading-none transition-colors duration-150"
                  style={{
                    color: isActive
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>
      {/* ── Drawer for extra tabs (Vault + Highlights) ───────────── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl
                         border-t border-(--border-subtle)
                         bg-(--bg-surface) p-6
                         pb-[max(1.5rem,env(safe-area-inset-bottom))]
                         shadow-2xl md:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-manrope text-lg font-bold text-(--text-primary)">
                    Explore
                  </h3>
                  <p className="text-[11px] text-(--text-muted)">
                    Navigate to other areas
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-full bg-(--bg-overlay) p-2 text-(--text-secondary) active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {MORE_ITEMS.map((item) => {
                  const isActive = activeTab === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleTabPress(item.key)
                        setIsDrawerOpen(false)
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5
                                 transition-colors active:scale-95
                                 ${isActive
                          ? 'bg-(--bg-elevated) text-(--text-primary)'
                          : 'text-(--text-secondary) hover:bg-(--bg-overlay)'}`}
                    >
                      <item.icon
                        style={{
                          width: 20,
                          height: 20,
                          strokeWidth: isActive ? 2.2 : 1.8,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      />
                      <span className="text-sm font-semibold">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="drawerActiveIndicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-(--text-primary)"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}