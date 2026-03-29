import { RegisterForm } from '../components/RegisterForm'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl tracking-tight">SheryMemory</h1>
        <p className="mt-2 text-(--text-secondary)">
          Create your secure memory box
        </p>
      </div>

      <RegisterForm />

      <p className="mt-4 text-center text-(--text-muted)">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-(--accent) hover:text-(--accent-hover)"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
