"use client";

import { useEffect } from "react";
import { useHighlights } from "../hooks/useHighlights";

interface HighlightListProps {
  url: string;
}

export function HighlightList({ url }: HighlightListProps) {
  const { highlights, fetchHighlights, deleteHighlight, isLoading } =
    useHighlights(url);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  if (isLoading && highlights.length === 0) {
    return (
      <div className="mt-4 space-y-2 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
        Highlights
      </h4>
      <div className="flex flex-col gap-2">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="group relative p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border-l-2 border-indigo-500 rounded-r-lg"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{highlight.text}"
            </p>
            <button
              onClick={() => deleteHighlight(highlight.id)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
