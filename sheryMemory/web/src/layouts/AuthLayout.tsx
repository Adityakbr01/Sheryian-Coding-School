import { Outlet, Link } from 'react-router-dom';
import Pattern from '../components/Pattern';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-base)]">
      <div className="flex flex-col justify-center items-center p-8 lg:p-12">
        <Link
          to="/"
          className="absolute top-8 left-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-2"
        >
          &larr; Back home
        </Link>
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
      <Pattern />
    </div>
  );
}
