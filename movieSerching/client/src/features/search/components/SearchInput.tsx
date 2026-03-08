import type { Ref } from "react";
import { HiSearch } from "react-icons/hi";

interface SearchInputProps {
  inputRef: Ref<HTMLInputElement>;
  searchQuery: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching: boolean;
}

export default function SearchInput({
  inputRef,
  searchQuery,
  onInputChange,
  isSearching,
}: SearchInputProps) {
  return (
    <div className="relative mb-6 max-w-2xl">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={onInputChange}
        placeholder="Search for movies, TV shows, people..."
        className="w-full bg-black/5 dark:bg-black/40 border-2 border-border/50 rounded-lg px-5 py-4 pl-12 text-lg font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-(--custom-primary) focus:bg-black/10 focus:ring-2 focus:ring-(--custom-primary)/20 shadow-sm transition-all"
        autoFocus
      />
      <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl" />
      {isSearching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-(--custom-primary) border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
