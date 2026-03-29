import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) p-8">
      <h3 className="mb-6 text-center text-2xl font-bold text-(--text-primary)">
        Log In
      </h3>

      {loginError && (
        <div className="mb-6 rounded-md border border-(--error-border) bg-(--error-bg) px-4 py-3 text-sm text-(--error-text)">
          {loginError.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-(--input-border) bg-(--input-bg) px-4 py-2.5 text-(--input-text) placeholder-(--input-placeholder) transition-all focus:border-(--input-focus-border) focus:ring-4 focus:ring-(--input-focus-ring) focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-(--input-border) bg-(--input-bg) px-4 py-2.5 text-(--input-text) placeholder-(--input-placeholder) transition-all focus:border-(--input-focus-border) focus:ring-4 focus:ring-(--input-focus-ring) focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="group relative z-[1] mt-2 w-full overflow-hidden rounded-full bg-(--accent) py-2.5 font-medium text-(--text-on-accent) transition-colors hover:bg-(--accent-hover) disabled:border-(--btn-disabled-border) disabled:bg-(--btn-disabled-bg) disabled:text-(--btn-disabled-text)"
        >
          <span className="relative inline-block overflow-hidden align-middle">
            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </span>
            <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </span>
          </span>
        </button>
      </form>
    </div>
  )
}
