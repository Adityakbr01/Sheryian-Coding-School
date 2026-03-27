import { LoginForm } from '../components/LoginForm';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-center">
        <h1 className="text-3xl tracking-tight">SheryMemory</h1>
        <p className="text-[var(--text-secondary)] mt-2">Sign in to your account</p>
      </div>
      
      <LoginForm />
      
      <p className="text-center text-[var(--text-muted)] mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
