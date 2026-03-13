import { useState } from "react";
import { CollectionResponse } from "../../collections/schemas/collection.schema";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, collectionId?: string) => Promise<void>;
  isLoading: boolean;
  collections: CollectionResponse[];
}

export function SaveModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
  collections,
}: SaveModalProps) {
  const [url, setUrl] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(url, collectionId || undefined);
    setUrl("");
    setCollectionId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Save New Item
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Paste a link to any article, video, or PDF.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 px-1 uppercase tracking-wider">
                  URL
                </label>
                <input
                  type="url"
                  required
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 px-1 uppercase tracking-wider">
                  Add to Collection (Optional)
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">No Collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !url}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
