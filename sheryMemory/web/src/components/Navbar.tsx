import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../features/auth/hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          SheryMemory
        </Link>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium">
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-2 rounded-md hover:bg-[var(--border-strong)] transition-colors font-medium cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-[var(--accent)] text-[var(--text-on-accent)] px-4 py-2 rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
