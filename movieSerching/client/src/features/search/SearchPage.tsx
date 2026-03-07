import Loader from "@/components/common/Loader";
import MovieCard from "@/components/common/MovieCard";
import { SkeletonGrid } from "@/components/common/SkeletonCard";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useDebounce } from "@/hooks/useDebounce";
import { getImageUrl } from "@/lib/utils";
import type { SearchCategory } from "@/store/slices/movieSlice";
import {
  clearSearch,
  searchByCategory,
  setSearchCategory,
  setSearchQuery,
} from "@/store/slices/movieSlice";
import type { TMDBPerson } from "@/types";
import { useCallback, useEffect, useRef } from "react";
import {
  HiCollection,
  HiDesktopComputer,
  HiFilm,
  HiSearch,
  HiUsers,
} from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, useSearchParams } from "react-router-dom";

const categories: {
  key: SearchCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "all", label: "All", icon: <HiCollection className="text-base" /> },
  { key: "movie", label: "Movies", icon: <HiFilm className="text-base" /> },
  {
    key: "tv",
    label: "TV Shows",
    icon: <HiDesktopComputer className="text-base" />,
  },
  { key: "person", label: "People", icon: <HiUsers className="text-base" /> },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    searchQuery,
    searchPage,
    searchTotalPages,
    searchCategory,
    searchTotalResults,
    isSearching,
    isLoading,
  } = useAppSelector((state) => state.movies);

  const queryFromUrl = searchParams.get("q") || "";
  const categoryFromUrl = (searchParams.get("type") as SearchCategory) || "all";
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Sync URL query to state on mount
  useEffect(() => {
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      dispatch(setSearchQuery(queryFromUrl));
    }
    if (categoryFromUrl !== searchCategory) {
      dispatch(setSearchCategory(categoryFromUrl));
    }
    inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger search on debounced query or category change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatch(clearSearch());
      dispatch(setSearchQuery(debouncedQuery));
      dispatch(
        searchByCategory({
          query: debouncedQuery.trim(),
          page: 1,
          category: searchCategory,
        }),
      );
      setSearchParams(
        {
          q: debouncedQuery.trim(),
          ...(searchCategory !== "all" ? { type: searchCategory } : {}),
        },
        { replace: true },
      );
    } else {
      dispatch(clearSearch());
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, searchCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMore = useCallback(() => {
    if (searchPage < searchTotalPages && debouncedQuery.trim()) {
      dispatch(
        searchByCategory({
          query: debouncedQuery.trim(),
          page: searchPage + 1,
          category: searchCategory,
        }),
      );
    }
  }, [dispatch, searchPage, searchTotalPages, debouncedQuery, searchCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleCategoryChange = (cat: SearchCategory) => {
    if (cat === searchCategory) return;
    dispatch(setSearchCategory(cat));
  };

  const isPerson = (item: any): item is TMDBPerson =>
    item.media_type === "person" || searchCategory === "person";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find movies, TV shows, and people
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6 max-w-2xl">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search for movies, TV shows, people..."
          className="w-full bg-black/5 dark:bg-black/40 border-2 border-border/50 rounded-lg px-5 py-4 pl-12 text-lg font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--custom-primary)] focus:bg-black/10 focus:ring-2 focus:ring-[var(--custom-primary)]/20 shadow-sm transition-all"
          autoFocus
        />
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl" />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--custom-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              searchCategory === cat.key
                ? "bg-[var(--custom-primary)] text-white shadow-lg shadow-[var(--custom-primary)]/25"
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

      {/* Results */}
      {isLoading && searchResults.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : searchResults.length > 0 ? (
        <>
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {searchResults.length} of{" "}
            {searchTotalResults.toLocaleString()} results for "
            <span className="text-foreground font-medium">
              {debouncedQuery}
            </span>
            "
          </p>

          <InfiniteScroll
            dataLength={searchResults.length}
            next={fetchMore}
            hasMore={searchPage < searchTotalPages}
            loader={<Loader size="md" />}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((item: any, idx: number) =>
                isPerson(item) ? (
                  <PersonCard key={`person-${item.id}-${idx}`} person={item} />
                ) : (
                  <MovieCard
                    key={`${item.id}-${idx}`}
                    movie={item}
                    showMediaType={searchCategory === "all"}
                  />
                ),
              )}
            </div>
          </InfiniteScroll>
        </>
      ) : debouncedQuery && !isLoading ? (
        <EmptyState
          icon={
            <HiSearch className="mx-auto text-6xl text-muted-foreground/50 mb-4" />
          }
          title={`No results found for "${debouncedQuery}"`}
          subtitle="Try different keywords or change the search category"
        />
      ) : !debouncedQuery ? (
        <EmptyState
          icon={
            <HiSearch className="mx-auto text-6xl text-muted-foreground/50 mb-4" />
          }
          title="Start typing to search"
          subtitle="Search for movies, TV shows, and people"
        />
      ) : null}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function PersonCard({ person }: { person: TMDBPerson }) {
  return (
    <Link to={`/person/${person.id}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-card border border-border/50">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={getImageUrl(person.profile_path)}
            alt={person.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute top-2 right-2 bg-purple-600/80 rounded-full px-2 py-0.5">
          <span className="text-xs font-medium text-white">PERSON</span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
            {person.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {person.known_for_department}
          </p>
          {person.known_for && person.known_for.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {person.known_for
                .slice(0, 2)
                .map((m) => m.title || m.name)
                .join(", ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center py-20">
      {icon}
      <p className="text-foreground text-lg font-medium">{title}</p>
      <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
    </div>
  );
}
