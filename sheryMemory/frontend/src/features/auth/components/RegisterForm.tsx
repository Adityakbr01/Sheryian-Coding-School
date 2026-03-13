"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Create Account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password{" "}
            <span className="text-xs text-gray-500 font-normal">
              (min 6 chars)
            </span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium rounded-lg shadow-sm transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
