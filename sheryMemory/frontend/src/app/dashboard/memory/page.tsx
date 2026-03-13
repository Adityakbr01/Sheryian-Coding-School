"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface MemoryItem {
  id: string;
  title: string | null;
  url: string;
  type: string;
  createdAt: string;
  tags: { tag: { name: string } }[];
}

export default function MemoryPage() {
  const [dueItems, setDueItems] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore.getState().token;

  const fetchDueItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/memory/due`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setDueItems(json.data || []);
    } catch {
      setDueItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDueItems();
  }, [fetchDueItems]);

  const markReviewed = async (itemId: string) => {
    await fetch(`${API_URL}/memory/${itemId}/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDueItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (dueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-gray-400">
        <svg
          className="h-16 w-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm mt-1">
          No items due for review right now. Come back later.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Memory Review</h2>
        <p className="text-gray-400 text-sm mt-1">
          {dueItems.length} item{dueItems.length > 1 ? "s" : ""} due for review
        </p>
      </div>

      <div className="grid gap-4">
        {dueItems.map((item) => {
          const daysSaved = Math.floor(
            (Date.now() - new Date(item.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return (
            <div
              key={item.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 capitalize">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {daysSaved} days ago
                  </span>
                </div>
                <h3 className="text-white font-medium truncate">
                  {item.title || item.url}
                </h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-xs truncate block mt-0.5"
                >
                  {item.url}
                </a>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => markReviewed(item.id)}
                className="shrink-0 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                ✓ Mark Reviewed
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
