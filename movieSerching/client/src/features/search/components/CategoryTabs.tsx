import type { SearchCategory } from "@/store/slices/movieSlice";

interface CategoryTabItem {
  key: SearchCategory;
  label: string;
  icon: React.ReactNode;
}

interface CategoryTabsProps {
  categories: CategoryTabItem[];
  searchCategory: SearchCategory;
  searchTotalResults: number;
  onCategoryChange: (cat: SearchCategory) => void;
}

export default function CategoryTabs({
  categories,
  searchCategory,
  searchTotalResults,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
            searchCategory === cat.key
              ? "bg-(--custom-primary) text-white shadow-lg shadow-(--custom-primary)/25"
              : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10"
          }`}
        >
          {cat.icon}
          {cat.label}
          {searchCategory === cat.key && searchTotalResults > 0 && (
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
              {searchTotalResults.toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
