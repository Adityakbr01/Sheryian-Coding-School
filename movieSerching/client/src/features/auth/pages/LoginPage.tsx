import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { login, clearError } from "@/store/slices/authSlice";
import LoginForm from "../components/LoginForm";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fadeInUp">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-border/50">
          <h1 className="text-3xl md:text-4xl font-juana tracking-wide text-foreground text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-center mb-8 font-NeuMachina">
            Sign in to your account
          </p>

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

          <p className="text-center text-muted-foreground text-sm mt-6 font-NeuMachina">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[var(--custom-primary)] hover:text-[var(--custom-primary)]/80 font-bold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
