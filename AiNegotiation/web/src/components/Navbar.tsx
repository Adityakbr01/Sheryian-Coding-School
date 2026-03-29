import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../features/auth/hooks/useAuth'

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--border-subtle) bg-(--bg-surface)/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-(--text-primary)">
          🛒 NegotiateAI
        </Link>
        <nav className="flex items-center gap-4">
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
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <button
                onClick={() => logout()}
                className="cursor-pointer rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-4 py-2 font-medium text-(--text-primary) transition-colors hover:bg-(--border-strong)"
              >
                Log out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
