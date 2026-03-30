import { Outlet, Link } from 'react-router-dom'
import Pattern from '../components/Pattern'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-(--bg-base) lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-2 md:p-8 lg:p-12">
        <Link
          to="/"
          className="absolute top-8 left-8 inline-flex items-center gap-2 text-(--text-secondary) transition-colors hover:text-(--text-primary)"
        >
          &larr; Back home
        </Link>
        <div className="w-full  md:max-w-[400px]">
          <Outlet />
        </div>
      </div>
      <Pattern />
    </div>
  )
}
