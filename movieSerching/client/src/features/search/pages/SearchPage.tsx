import Loader from "@/components/common/Loader";
import MovieCard from "@/components/common/MovieCard";
import { SkeletonGrid } from "@/components/common/SkeletonCard";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchCategory } from "@/store/slices/movieSlice";
import SearchInput from "../components/SearchInput";
import CategoryTabs from "../components/CategoryTabs";
import PersonCard from "../components/PersonCard";
import SearchEmptyState from "../components/SearchEmptyState";
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

  // Sync URL query to state on mount and when URL changes
  useEffect(() => {
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      dispatch(setSearchQuery(queryFromUrl));
    } else if (!queryFromUrl && searchQuery) {
      // Clear search if URL query is removed
      dispatch(setSearchQuery(""));
    }

    if (categoryFromUrl !== searchCategory) {
      dispatch(setSearchCategory(categoryFromUrl));
    }
    inputRef.current?.focus();
  }, [queryFromUrl, categoryFromUrl, dispatch]); // Added URL dependencies // eslint-disable-line react-hooks/exhaustive-deps

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
      <SearchInput
        inputRef={inputRef}
        searchQuery={searchQuery}
        onInputChange={handleInputChange}
        isSearching={isSearching}
      />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        searchCategory={searchCategory}
        searchTotalResults={searchTotalResults}
        onCategoryChange={handleCategoryChange}
      />

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
        <SearchEmptyState
          icon={
            <HiSearch className="mx-auto text-6xl text-muted-foreground/50 mb-4" />
          }
          title={`No results found for "${debouncedQuery}"`}
          subtitle="Try different keywords or change the search category"
        />
      ) : !debouncedQuery ? (
        <SearchEmptyState
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
