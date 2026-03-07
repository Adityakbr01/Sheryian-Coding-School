import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchTrending } from "@/store/slices/movieSlice";
import MovieCard from "@/components/common/MovieCard";
import { SkeletonGrid } from "@/components/common/SkeletonCard";

export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const { trending, isLoading } = useAppSelector((state) => state.movies);
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("day");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    dispatch(fetchTrending({ media: mediaType, time: timeWindow }));
  }, [dispatch, timeWindow, mediaType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <h1 className="text-3xl md:text-5xl font-juana tracking-wide text-foreground mb-6">
        Trending
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          {(["day", "week"] as const).map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer font-NeuMachina ${
                timeWindow === tw
                  ? "bg-[var(--custom-accentColor)] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {tw === "day" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          {(["all", "movie", "tv"] as const).map((mt) => (
            <button
              key={mt}
              onClick={() => setMediaType(mt)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer font-NeuMachina ${
                mediaType === mt
                  ? "bg-[var(--custom-primary)] text-black shadow-[0_0_10px_rgba(27,209,166,0.5)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {mt === "all" ? "All" : mt === "movie" ? "Movies" : "TV Shows"}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <SkeletonGrid count={20} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trending.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showMediaType />
          ))}
        </div>
      )}

      {!isLoading && trending.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nothing trending right now.
        </p>
      )}
    </div>
  );
}
