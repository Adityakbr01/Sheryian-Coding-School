import { Outlet, Link } from 'react-router-dom'
import Pattern from '../components/Pattern'

export function AuthLayout() {
  return (
    <div className="grid h-screen w-full overflow-hidden bg-(--bg-base) md:grid-cols-2">
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-8 lg:p-12 custom-scrollbar">
        <Link
          to="/"
          className="absolute top-8 left-8 inline-flex items-center gap-2 text-(--text-secondary) transition-colors hover:text-(--text-primary)"
        >
          &larr; Back home
        </Link>
        <div className="w-full md:overflow-hidden max-w-[400px] md:py-4 pt-28">
          <Outlet />
        </div>
      </div>
      <Pattern className="hidden md:block" />
    </div>
  )
}
