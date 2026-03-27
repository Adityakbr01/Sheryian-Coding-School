import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
        Log In
      </h3>

      {loginError && (
        <div className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded-md mb-6 text-sm">
          {loginError.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] px-4 py-2.5 rounded-md focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-4 focus:ring-[var(--input-focus-ring)] transition-all placeholder-[var(--input-placeholder)]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] px-4 py-2.5 rounded-md focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-4 focus:ring-[var(--input-focus-ring)] transition-all placeholder-[var(--input-placeholder)]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full group relative overflow-hidden z-[1] bg-[var(--accent)] text-[var(--text-on-accent)] font-medium py-2.5 rounded-full hover:bg-[var(--accent-hover)] transition-colors mt-2 disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] disabled:border-[var(--btn-disabled-border)]"
        >
          <span className="inline-block relative overflow-hidden align-middle">
            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </span>
            <span className="absolute inset-0 block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full group-hover:translate-y-0">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </span>
          </span>
        </button>
      </form>
    </div>
  );
}
