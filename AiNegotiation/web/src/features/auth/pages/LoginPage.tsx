import { LoginForm } from '../components/LoginForm'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl tracking-tight">SheryNegotiateAI</h1>
        <p className="mt-2 text-(--text-secondary)">Sign in to your account</p>
      </div>

      <LoginForm />

      <p className="mt-4 text-center text-(--text-muted)">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-(--accent) hover:text-(--accent-hover)"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
