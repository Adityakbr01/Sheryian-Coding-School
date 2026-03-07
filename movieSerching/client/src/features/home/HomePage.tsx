import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiPlay, HiInformationCircle } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
} from "@/store/slices/movieSlice";
import {
  getBackdropUrl,
  getMediaTitle,
  truncateText,
  getMediaDate,
} from "@/lib/utils";
import MovieRow from "@/components/common/MovieRow";
import TrailerModal from "@/components/common/TrailerModal";
import ErrorState from "@/components/common/ErrorState";
import { SkeletonHero, SkeletonGrid } from "@/components/common/SkeletonCard";
import { movieService } from "@/services/movieService";
import type { TMDBMovie, TMDBVideo } from "@/types";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { trending, popular, topRated, isLoading, error } = useAppSelector(
    (state) => state.movies,
  );
  const [heroIdx, setHeroIdx] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTrending({ media: "all", time: "day" }));
    dispatch(fetchPopular({ type: "movie" }));
    dispatch(fetchTopRated({ type: "movie" }));
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchTrending({ media: "all", time: "day" }));
    dispatch(fetchPopular({ type: "movie" }));
    dispatch(fetchTopRated({ type: "movie" }));
  };

  // Cycle hero banner
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trending]);

  const hero: TMDBMovie | undefined = trending[heroIdx];

  const handleTrailer = async () => {
    if (!hero) return;
    try {
      const type = hero.media_type === "tv" ? "tv" : "movie";
      const data = await movieService.getVideos(
        hero.id,
        type as "movie" | "tv",
      );
      const trailer = data.results.find(
        (v: TMDBVideo) => v.type === "Trailer" && v.site === "YouTube",
      );
      if (trailer) setTrailerKey(trailer.key);
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      {/* Error State */}
      {!isLoading && error && trending.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState
            title="Unable to Load Content"
            message="We're having trouble connecting to our servers. Please check your internet connection and try again."
            onRetry={handleRetry}
          />
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          {isLoading && !hero ? (
            <SkeletonHero />
          ) : hero ? (
            <div className="relative h-[70vh] overflow-hidden">
              <img
                src={getBackdropUrl(hero.backdrop_path)}
                alt={getMediaTitle(hero)}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                width={1280}
                height={720}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 animate-fadeInUp">
                <h1 className="text-4xl md:text-6xl font-juana font-bold text-foreground mb-4 max-w-3xl drop-shadow-lg tracking-wide leading-tight">
                  {getMediaTitle(hero)}
                </h1>
                <div className="flex items-center gap-4 mb-4 text-sm text-foreground/90 font-HelveticaNow">
                  <span className="flex items-center gap-1">
                    ⭐ {hero.vote_average.toFixed(1)}
                  </span>
                  <span>
                    {getMediaDate(hero)
                      ? new Date(getMediaDate(hero)).getFullYear()
                      : ""}
                  </span>
                  {hero.media_type && (
                    <span className="bg-[var(--custom-primary)]/80 text-black px-2.5 py-0.5 rounded-full text-xs font-bold uppercase shadow-[0_0_10px_rgba(27,209,166,0.5)]">
                      {hero.media_type}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground max-w-xl text-sm md:text-base mb-6">
                  {truncateText(hero.overview, 200)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleTrailer}
                    className="btn-primary text-[0.6rem] md:text-base flex items-center gap-2 cursor-pointer"
                  >
                    <HiPlay size={20} /> Watch Trailer
                  </button>
                  <Link
                    to={`/${hero.media_type === "tv" ? "tv" : "movie"}/${hero.id}`}
                    className="btn-secondary text-[0.6rem] md:text-base flex items-center gap-2 text-foreground"
                  >
                    <HiInformationCircle size={20} /> More Info
                  </Link>
                </div>

                {/* Hero indicators */}
                <div className="flex gap-2 mt-8">
                  {trending.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                        i === heroIdx
                          ? "w-10 bg-[var(--custom-accentColor)] shadow-[0_0_8px_rgba(232,96,46,0.8)]"
                          : "w-4 bg-foreground/30 hover:bg-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Content Rows */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            {isLoading && !trending.length ? (
              <SkeletonGrid count={12} />
            ) : (
              <>
                <MovieRow
                  title="🔥 Trending Today"
                  movies={trending}
                  viewAllLink="/trending"
                  showMediaType
                />
                <MovieRow
                  title="🎬 Popular Movies"
                  movies={popular}
                  viewAllLink="/movies"
                />
                <MovieRow
                  title="⭐ Top Rated"
                  movies={topRated}
                  viewAllLink="/movies"
                />
              </>
            )}
          </div>

          {/* Trailer Modal */}
          {trailerKey && (
            <TrailerModal
              videoKey={trailerKey}
              onClose={() => setTrailerKey(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
