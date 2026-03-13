import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          SheryMemory
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Start saving your thoughts automatically
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
