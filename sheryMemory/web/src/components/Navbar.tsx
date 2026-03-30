import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Brain, Menu, X, Rocket, LogIn, LayoutDashboard, LogOut } from 'lucide-react'
import { SlideButton } from './SlideButton'

export function Navbar() {
  const { isAuthenticated, logout: authLogout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Memoize navigation links to prevent recreation on every render
  const navLinks = useMemo(() => {
    return isAuthenticated
      ? [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }]
      : [{ label: 'Sign in', to: '/login', icon: LogIn }]
  }, [isAuthenticated])

  // Optimize scroll lock to prevent layout shifts
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = originalStyle }
  }, [isOpen])

  // Memoize handlers
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), [])
  const handleClose = useCallback(() => setIsOpen(false), [])
  const handleLogout = useCallback(() => {
    authLogout()
    setIsOpen(false)
  }, [authLogout])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-(--border-subtle) bg-(--bg-surface)/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link
          to="/"
          onClick={handleClose}
          className="flex items-center gap-2 text-xl font-black tracking-tighter text-(--text-primary)"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent) shadow-lg shadow-(--accent)/20">
            <Brain className="h-5 w-5 text-(--text-on-accent)" />
          </div>
          <span className="hidden sm:block">SheryMemory</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
            >
              {link.label}
            </Link>
          ))}

          <ThemeToggle />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-(--text-secondary) transition-colors hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : (
            <Link to="/register">
              <SlideButton size="sm" className="px-6 py-2">
                Join Now
              </SlideButton>
            </Link>
          )}
        </nav>

        {/* Mobile Toggle & Theme Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="relative z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-(--bg-elevated) border border-(--border-subtle) text-(--text-primary)"
            aria-label="Toggle Menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="h-5 w-5 text-(--accent)" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[105] bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
              className="fixed top-0 right-0 z-[106] h-screen w-[280px] bg-(--bg-surface) border-l border-(--border-subtle) p-6 shadow-2xl md:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="mt-12 flex flex-col gap-2">
                  <p className="px-4 text-[10px] font-bold tracking-[0.2em] text-(--text-muted) uppercase">Navigation</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={handleClose}
                      className="group flex items-center gap-3 rounded-2xl p-4 text-base font-bold text-(--text-primary) transition-all hover:bg-(--accent)/10 hover:text-(--accent)"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--bg-elevated) group-hover:bg-(--accent)/20">
                        <link.icon className="h-5 w-5" />
                      </div>
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500/10 p-4 text-base font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out account
                    </button>
                  ) : (
                    <Link to="/register" onClick={handleClose}>
                      <SlideButton fullWidth size="lg">
                        <div className="flex items-center justify-center gap-2">
                          <Rocket className="h-5 w-5" /> Start for Free
                        </div>
                      </SlideButton>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
