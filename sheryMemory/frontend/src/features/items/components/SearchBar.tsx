import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");

  // Debounce the search so we don't spam the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className={`h-5 w-5 text-gray-400 ${isLoading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isLoading ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          )}
        </svg>
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm hover:shadow-md"
        placeholder="Search semantically (e.g. 'how to make coffee' or 'rust lifetimes')..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
