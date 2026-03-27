import { RegisterForm } from '../components/RegisterForm';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-center">
        <h1 className="text-3xl tracking-tight">SheryMemory</h1>
        <p className="text-[var(--text-secondary)] mt-2">Create your secure memory box</p>
      </div>
      
      <RegisterForm />
      
      <p className="text-center text-[var(--text-muted)] mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
