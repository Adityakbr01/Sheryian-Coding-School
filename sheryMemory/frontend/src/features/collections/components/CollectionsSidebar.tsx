"use client";

import { useState } from "react";
import { useCollections } from "../hooks/useCollections";

interface CollectionsSidebarProps {
  onSelectCollection: (id: string | null) => void;
  selectedCollectionId: string | null;
}

export function CollectionsSidebar({
  onSelectCollection,
  selectedCollectionId,
}: CollectionsSidebarProps) {
  const { collections, createCollection, isLoading, deleteCollection } =
    useCollections();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await createCollection({ name: newCollectionName.trim() });
      setNewCollectionName("");
      setIsAdding(false);
    } catch (err) {
      // Error is handled in hook
    }
  };

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          Collections
        </h3>

        <button
          onClick={() => onSelectCollection(null)}
          className={`px-3 py-2 text-sm font-medium rounded-xl transition-all text-left ${
            selectedCollectionId === null
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          All Memories
        </button>

        {collections.map((collection) => (
          <div key={collection.id} className="group flex items-center gap-1">
            <button
              onClick={() => onSelectCollection(collection.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all text-left truncate ${
                selectedCollectionId === collection.id
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              # {collection.name}
            </button>
            <button
              onClick={() => deleteCollection(collection.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
              title="Delete Collection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div>
        {isAdding ? (
          <form onSubmit={handleCreate} className="px-3">
            <input
              type="text"
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-lg outline-none transition-all dark:text-white mb-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !newCollectionName.trim()}
                className="flex-1 text-xs font-semibold py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewCollectionName("");
                }}
                className="px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all text-left flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Collection
          </button>
        )}
      </div>
    </div>
  );
}
