import { ItemResponse } from "../schemas/item.schema";
import { CollectionResponse } from "../../collections/schemas/collection.schema";
import { HighlightList } from "../../highlights/components/HighlightList";

interface ItemCardProps {
  item: ItemResponse;
  onDelete?: (id: string) => void;
  collections?: CollectionResponse[];
}

export function ItemCard({ item, onDelete, collections }: ItemCardProps) {
  const isPending = item.status === "pending";
  const isFailed = item.status === "failed";

  const collection = collections?.find((c) => c.id === item.collectionId);

  const statusColor = isPending
    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    : isFailed
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {item.type}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}
          >
            {item.status}
          </span>
          {collection && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              # {collection.name}
            </span>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
        {item.title || "Processing Title..."}
      </h3>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate mb-4"
      >
        {item.url}
      </a>

      <div className="mb-4">
        {item.tags?.slice(0, 3).map((tagObj, idx) => (
          <span
            key={idx}
            className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md mr-2"
          >
            #{tagObj.tag.name}
          </span>
        ))}
      </div>

      {!isPending && <HighlightList url={item.url} />}

      {isPending && (
        <div className="mt-auto animate-pulse w-full h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      )}
    </div>
  );
}
