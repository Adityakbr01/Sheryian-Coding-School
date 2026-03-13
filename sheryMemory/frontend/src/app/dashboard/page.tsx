"use client";

import { useEffect, useState } from "react";
import { useItems } from "@/features/items/hooks/useItems";
import { ItemGrid } from "@/features/items/components/ItemGrid";
import { SaveModal } from "@/features/items/components/SaveModal";
import { SearchBar } from "@/features/items/components/SearchBar";
import { CollectionsSidebar } from "@/features/collections/components/CollectionsSidebar";
import { useCollections } from "@/features/collections/hooks/useCollections";

export default function DashboardPage() {
  const {
    items,
    isLoading,
    fetchItems,
    saveItem,
    deleteItem,
    error,
    setSearchQuery,
    currentCollectionId,
    setCurrentCollectionId,
  } = useItems();
  const { collections } = useCollections();
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 w-full">
      <CollectionsSidebar
        selectedCollectionId={currentCollectionId}
        onSelectCollection={setCurrentCollectionId}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentCollectionId
                ? collections.find((c) => c.id === currentCollectionId)?.name
                : "Recent Memories"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {currentCollectionId
                ? `Items in #${collections.find((c) => c.id === currentCollectionId)?.name}`
                : "Everything you've saved across the web."}
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            + Save Link
          </button>
        </div>

        <SearchBar onSearch={setSearchQuery} isLoading={isLoading} />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <ItemGrid
          items={items}
          isLoading={isLoading}
          onDelete={deleteItem}
          collections={collections}
        />

        {isModalOpen && (
          <SaveModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            collections={collections}
            onSave={async (url, collectionId) => {
              await saveItem({ url, collectionId });
              setModalOpen(false);
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
