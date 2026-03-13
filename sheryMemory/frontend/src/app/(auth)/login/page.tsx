import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          SheryMemory
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your personal internet memory
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
