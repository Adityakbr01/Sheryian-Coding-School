import { useEffect } from "react";
import { APP_INFO } from "@/constants";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { register, clearError } from "@/store/slices/authSlice";
import SignupForm from "../components/SignupForm";
import toast from "react-hot-toast";

export default function SignupPage() {
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

  const handleSubmit = (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    dispatch(register(data));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fadeInUp">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-border/50">
          <h1 className="text-3xl md:text-4xl font-juana tracking-wide text-foreground text-center mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center mb-8 font-NeuMachina">
            Join {APP_INFO.APP_NAME} today
          </p>

          <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />

          <p className="text-center text-muted-foreground text-sm mt-6 font-NeuMachina">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-(--custom-primary) hover:text-(--custom-primary)/80 font-bold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
