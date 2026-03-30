import { RegisterForm } from '../components/RegisterForm'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-8 sm:px-0">
      <div className="text-center">
        <h1 className="font-manrope text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl">
          SheryMemory
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary) sm:text-base">
          Create your secure memory box
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-(--text-muted)">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-(--accent) transition-colors hover:text-(--accent-hover)"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
