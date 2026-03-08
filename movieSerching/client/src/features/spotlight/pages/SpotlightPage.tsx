import { useEffect, useState } from "react";
import {
  HiSparkles,
  HiFilm,
  HiDesktopComputer,
  HiCollection,
} from "react-icons/hi";
import { adminService } from "@/services/adminService";
import Loader from "@/components/common/Loader";
import SpotlightCard from "../components/SpotlightCard";
import type { CustomMovie } from "@/types";

type FilterCategory = "all" | "movie" | "tv" | "both";

const filters: {
  label: string;
  value: FilterCategory;
  icon: React.ReactNode;
}[] = [
  { label: "All", value: "all", icon: <HiCollection /> },
  { label: "Movies", value: "movie", icon: <HiFilm /> },
  { label: "TV Shows", value: "tv", icon: <HiDesktopComputer /> },
];

export default function SpotlightPage() {
  const [movies, setMovies] = useState<CustomMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getAllMovies();
        setMovies(data);
      } catch {
        // silently fail — no auth needed, show empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filtered = movies.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "movie")
      return m.category === "movie" || m.category === "both";
    if (activeFilter === "tv")
      return m.category === "tv" || m.category === "both";
    return m.category === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HiSparkles className="text-amber-400 text-3xl" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-juana tracking-wide">
            Spotlight
          </h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          Handpicked movies and TV shows selected by our editors — discover
          something great today.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === f.value
                ? "bg-(--custom-primary) text-white shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {f.icon}
            {f.label}
            {f.value === "all" && (
              <span className="ml-1 text-xs opacity-70">({movies.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader size="md" />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols- md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {filtered.map((movie) => (
            <SpotlightCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-24">
          <HiSparkles className="mx-auto text-6xl text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nothing here yet
          </h2>
          <p className="text-muted-foreground">
            Check back soon — our editors are curating great content for you.
          </p>
        </div>
      ) : (
        <div className="text-center py-24">
          <HiFilm className="mx-auto text-6xl text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No results
          </h2>
          <p className="text-muted-foreground">
            Try a different category filter.
          </p>
        </div>
      )}
    </div>
  );
}
