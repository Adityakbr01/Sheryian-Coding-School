import { ItemResponse } from "../schemas/item.schema";
import { ItemCard } from "./ItemCard";
import { CollectionResponse } from "../../collections/schemas/collection.schema";

interface ItemGridProps {
  items: ItemResponse[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  collections?: CollectionResponse[];
}

export function ItemGrid({
  items,
  isLoading,
  onDelete,
  collections,
}: ItemGridProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800"
          ></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          No items saved yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Save your first URL using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          collections={collections}
        />
      ))}
    </div>
  );
}
