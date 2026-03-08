import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiPlay, HiInformationCircle } from "react-icons/hi";
import HeroCarousel from "../components/HeroCarousel";
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

  const handleTrailer = async (movie: TMDBMovie) => {
    try {
      const type = movie.media_type === "tv" ? "tv" : "movie";
      const data = await movieService.getVideos(
        movie.id,
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
          {isLoading && !trending.length ? (
            <SkeletonHero />
          ) : trending.length > 0 ? (
            <HeroCarousel movies={trending} onPlayTrailer={handleTrailer} />
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
