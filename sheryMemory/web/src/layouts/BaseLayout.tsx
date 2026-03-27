import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';

export function BaseLayout() {
  // Initialize Global Socket Listeners
  useSocket();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-[var(--text-muted)] text-sm">
          &copy; {new Date().getFullYear()} SheryMemory. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
