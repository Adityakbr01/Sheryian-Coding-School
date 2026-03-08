import { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  discoverMovies,
  fetchGenres,
  clearDiscover,
} from "@/store/slices/movieSlice";
import MovieCard from "@/components/common/MovieCard";
import { SkeletonGrid } from "@/components/common/SkeletonCard";
import ErrorState from "@/components/common/ErrorState";
import Loader from "@/components/common/Loader";
import TVFilter from "../components/TVFilter";

export default function TvShowsPage() {
  const dispatch = useAppDispatch();
  const {
    discoverResults,
    discoverPage,
    discoverTotalPages,
    genres,
    isLoading,
    error,
  } = useAppSelector((state) => state.movies);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  useEffect(() => {
    dispatch(fetchGenres("tv"));
    return () => {
      dispatch(clearDiscover());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearDiscover());
    dispatch(
      discoverMovies({ type: "tv", page: 1, genre: selectedGenre, sortBy }),
    );
  }, [dispatch, selectedGenre, sortBy]);

  const fetchMore = useCallback(() => {
    if (discoverPage < discoverTotalPages) {
      dispatch(
        discoverMovies({
          type: "tv",
          page: discoverPage + 1,
          genre: selectedGenre,
          sortBy,
        }),
      );
    }
  }, [dispatch, discoverPage, discoverTotalPages, selectedGenre, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <h1 className="text-3xl md:text-5xl font-juana tracking-wide text-foreground mb-6">
        TV Shows
      </h1>

      {/* Filters */}
      <TVFilter
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Results */}
      {isLoading && discoverResults.length === 0 ? (
        <SkeletonGrid count={18} />
      ) : (
        <InfiniteScroll
          dataLength={discoverResults.length}
          next={fetchMore}
          hasMore={discoverPage < discoverTotalPages}
          loader={<Loader size="md" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {discoverResults.map((show, idx) => (
              <MovieCard
                key={`${show.id}-${idx}`}
                movie={{ ...show, media_type: "tv" }}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {!isLoading && error && discoverResults.length === 0 ? (
        <ErrorState
          title="Unable to Load TV Shows"
          message="We couldn't fetch TV shows right now. This could be a temporary server issue."
          onRetry={() => {
            dispatch(clearDiscover());
            dispatch(
              discoverMovies({
                type: "tv",
                page: 1,
                genre: selectedGenre,
                sortBy,
              }),
            );
          }}
        />
      ) : !isLoading && discoverResults.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No TV shows found.
        </p>
      ) : null}
    </div>
  );
}
