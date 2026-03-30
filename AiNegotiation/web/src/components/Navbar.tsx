import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../features/auth/hooks/useAuth'

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--border-subtle) bg-(--bg-surface)/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight text-(--text-primary)"
        >
          🛒 NegotiateAI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/leaderboard"
            className="font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            🏆 Leaderboard
          </Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className="font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            >
              ⚙️ Admin
            </Link>
          )}
          <div className="flex items-center gap-4 border-l border-(--border-subtle) pl-6">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  closeMenu()
                }}
                className="cursor-pointer rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-4 py-2 font-medium text-(--text-primary) transition-colors hover:bg-(--border-strong)"
              >
                Log out
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-(--accent) px-4 py-2 font-medium text-(--text-on-accent) transition-colors hover:bg-(--accent-hover)"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Controls (Toggle + Theme) */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-elevated) text-(--text-primary) transition-colors hover:bg-(--border-strong)"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-(--border-subtle) bg-(--bg-surface) md:hidden"
          >
            <nav className="container mx-auto flex flex-col gap-6 p-6">
              <Link
                to="/leaderboard"
                onClick={closeMenu}
                className="text-lg font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
              >
                🏆 Leaderboard
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="text-lg font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                  ⚙️ Admin
                </Link>
              )}

              <div className="mt-4 flex flex-col gap-4 border-t border-(--border-subtle) pt-6">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-10 w-10 rounded-full bg-(--accent-muted) flex items-center justify-center text-(--accent) font-bold">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-(--text-primary)">{user?.name}</p>
                        <p className="text-xs text-(--text-muted)">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        closeMenu()
                      }}
                      className="w-full cursor-pointer rounded-md border border-(--border-subtle) bg-(--bg-elevated) py-3 font-medium text-(--text-primary) transition-colors hover:bg-(--border-strong)"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-elevated) py-3 font-medium text-(--text-primary) transition-colors hover:bg-(--border-strong)"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex items-center justify-center rounded-md bg-(--accent) py-3 font-medium text-(--text-on-accent) transition-colors hover:bg-(--accent-hover)"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
