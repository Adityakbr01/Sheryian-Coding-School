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
import MoviesFilter from "../components/MoviesFilter";
import Loader from "@/components/common/Loader";

export default function MoviesPage() {
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
  const [year, setYear] = useState("");

  useEffect(() => {
    dispatch(fetchGenres("movie"));
    return () => {
      dispatch(clearDiscover());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearDiscover());
    dispatch(
      discoverMovies({
        type: "movie",
        page: 1,
        genre: selectedGenre,
        sortBy,
        year,
      }),
    );
  }, [dispatch, selectedGenre, sortBy, year]);

  const fetchMore = useCallback(() => {
    if (discoverPage < discoverTotalPages) {
      dispatch(
        discoverMovies({
          type: "movie",
          page: discoverPage + 1,
          genre: selectedGenre,
          sortBy,
          year,
        }),
      );
    }
  }, [dispatch, discoverPage, discoverTotalPages, selectedGenre, sortBy, year]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <h1 className="text-3xl md:text-5xl font-juana tracking-wide text-foreground mb-6">
        Movies
      </h1>

      {/* Filters */}
      <MoviesFilter
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        year={year}
        onYearChange={setYear}
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
            {discoverResults.map((movie, idx) => (
              <MovieCard
                key={`${movie.id}-${idx}`}
                movie={{ ...movie, media_type: "movie" }}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {!isLoading && error && discoverResults.length === 0 ? (
        <ErrorState
          title="Unable to Load Movies"
          message="We couldn't fetch movies right now. This could be a temporary server issue."
          onRetry={() => {
            dispatch(clearDiscover());
            dispatch(
              discoverMovies({
                type: "movie",
                page: 1,
                genre: selectedGenre,
                sortBy,
                year,
              }),
            );
          }}
        />
      ) : !isLoading && discoverResults.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No movies found for the selected filters.
        </p>
      ) : null}
    </div>
  );
}
