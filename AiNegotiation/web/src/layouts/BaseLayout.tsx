import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useSocket } from '../hooks/useSocket'

export function BaseLayout() {
  // Initialize Global Socket Listeners
  useSocket()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-(--border-subtle) bg-(--bg-surface) py-6">
        <div className="container mx-auto px-4 text-center text-sm text-(--text-muted)">
          &copy; {new Date().getFullYear()} NegotiateAI — Master the Art of Bargaining 🛒
        </div>
      </footer>
    </div>
  )
}
