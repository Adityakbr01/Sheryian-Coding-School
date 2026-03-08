import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiSearch,
  HiFilm,
  HiDesktopComputer,
  HiUser,
  HiArrowRight,
} from "react-icons/hi";
import { movieService } from "@/services/movieService";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getImageUrl,
  getMediaTitle,
  getMediaDate,
  formatRating,
  getMediaType,
} from "@/lib/utils";
import type { TMDBMovie, TMDBPerson } from "@/types";

interface SearchDropdownProps {
  onClose: () => void;
}

interface QuickResults {
  movies: TMDBMovie[];
  tvShows: TMDBMovie[];
  people: TMDBPerson[];
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickResults>({
    movies: [],
    tvShows: [],
    people: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fetch results in parallel for all categories
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ movies: [], tvShows: [], people: [] });
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const opts = { signal: controller.signal };
        const [movieRes, tvRes, personRes] = await Promise.all([
          movieService.searchMovies(debouncedQuery.trim(), 1, opts),
          movieService.searchTv(debouncedQuery.trim(), 1, opts),
          movieService.searchPeople(debouncedQuery.trim(), 1, opts),
        ]);

        if (!controller.signal.aborted) {
          setResults({
            movies: (movieRes?.results || []).slice(0, 4),
            tvShows: (tvRes?.results || []).slice(0, 4),
            people: (personRes?.results || []).slice(0, 4),
          });
          setHasSearched(true);
        }
      } catch {
        if (!controller.signal.aborted) setHasSearched(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchResults();
    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const totalResults =
    results.movies.length + results.tvShows.length + results.people.length;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

      {/* Search panel */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl animate-in slide-in-from-top duration-200"
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, people..."
              className="w-full bg-black/5 dark:bg-black/40 border-2 border-border/50 rounded-lg px-5 py-3.5 pl-12 pr-20 text-base font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--custom-primary)] focus:bg-black/10 focus:ring-2 focus:ring-[var(--custom-primary)]/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-black/10 dark:bg-white/10 rounded-md px-2 py-1 hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              ESC
            </button>
          </form>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--custom-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {/* Results */}
          {!isLoading && totalResults > 0 && (
            <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-4 pb-2">
              {/* Movies */}
              {results.movies.length > 0 && (
                <ResultSection
                  title="Movies"
                  icon={<HiFilm className="text-blue-400" />}
                  viewAllLink={`/search?q=${encodeURIComponent(query)}&type=movie`}
                  onViewAll={handleResultClick}
                >
                  {results.movies.map((m) => (
                    <MovieResult
                      key={m.id}
                      item={m}
                      type="movie"
                      onClick={handleResultClick}
                    />
                  ))}
                </ResultSection>
              )}

              {/* TV Shows */}
              {results.tvShows.length > 0 && (
                <ResultSection
                  title="TV Shows"
                  icon={<HiDesktopComputer className="text-green-400" />}
                  viewAllLink={`/search?q=${encodeURIComponent(query)}&type=tv`}
                  onViewAll={handleResultClick}
                >
                  {results.tvShows.map((m) => (
                    <MovieResult
                      key={m.id}
                      item={m}
                      type="tv"
                      onClick={handleResultClick}
                    />
                  ))}
                </ResultSection>
              )}

              {/* People */}
              {results.people.length > 0 && (
                <ResultSection
                  title="People"
                  icon={<HiUser className="text-purple-400" />}
                  viewAllLink={`/search?q=${encodeURIComponent(query)}&type=person`}
                  onViewAll={handleResultClick}
                >
                  {results.people.map((p: any) => (
                    <PersonResult
                      key={p.id}
                      person={p}
                      onClick={handleResultClick}
                    />
                  ))}
                </ResultSection>
              )}

              {/* View all link */}
              <Link
                to={`/search?q=${encodeURIComponent(query)}`}
                onClick={handleResultClick}
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--custom-primary)] hover:text-[var(--custom-primary)]/80 transition-colors"
              >
                View all results <HiArrowRight />
              </Link>
            </div>
          )}

          {/* No results */}
          {!isLoading &&
            hasSearched &&
            totalResults === 0 &&
            debouncedQuery.trim() && (
              <div className="text-center py-8">
                <HiSearch className="mx-auto text-4xl text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No results for "
                  <span className="text-foreground">{debouncedQuery}</span>"
                </p>
              </div>
            )}

          {/* Hint when empty */}
          {!query && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Type to search for movies, TV shows, and people
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <HiFilm /> Movies
                </span>
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <HiDesktopComputer /> TV Shows
                </span>
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <HiUser /> People
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- Sub-components ---------- */

function ResultSection({
  title,
  icon,
  viewAllLink,
  onViewAll,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  viewAllLink: string;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon} {title}
        </div>
        <Link
          to={viewAllLink}
          onClick={onViewAll}
          className="text-xs text-[var(--custom-primary)] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MovieResult({
  item,
  type,
  onClick,
}: {
  item: TMDBMovie;
  type: "movie" | "tv";
  onClick: () => void;
}) {
  const title = getMediaTitle(item);
  const date = getMediaDate(item);
  const year = date ? new Date(date).getFullYear() : null;

  return (
    <Link
      to={`/${type}/${item.id}`}
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
    >
      <img
        src={getImageUrl(item.poster_path, "w92")}
        alt={title}
        className="w-10 h-14 rounded object-cover flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {year && <span>{year}</span>}
          {item.vote_average > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="text-yellow-400">&#9733;</span>{" "}
              {formatRating(item.vote_average)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PersonResult({
  person,
  onClick,
}: {
  person: TMDBPerson;
  onClick: () => void;
}) {
  return (
    <Link
      to={`/person/${person.id}`}
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
    >
      <img
        src={getImageUrl(person.profile_path, "w92")}
        alt={person.name}
        className="w-10 h-14 rounded object-cover flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
          {person.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {person.known_for_department}
          {person.known_for && person.known_for.length > 0 && (
            <span className="ml-1">
              &middot;{" "}
              {person.known_for
                .slice(0, 2)
                .map((m) => m.title || m.name)
                .join(", ")}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
