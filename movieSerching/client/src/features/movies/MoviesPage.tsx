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
import CustomSelect from "@/components/common/CustomSelect";
import ErrorState from "@/components/common/ErrorState";
import { SORT_OPTIONS } from "@/constants";
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
      <div className="flex flex-wrap gap-3 mb-6">
        <CustomSelect
          value={selectedGenre}
          onChange={setSelectedGenre}
          options={[
            { label: "All Genres", value: "" },
            ...genres.map((g) => ({ label: g.name, value: g.id.toString() })),
          ]}
          placeholder="All Genres"
          className="w-40"
        />

        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
          placeholder="Sort By"
          className="w-48"
        />

        <CustomSelect
          value={year}
          onChange={setYear}
          options={[
            { label: "All Years", value: "" },
            ...Array.from({ length: 30 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return { label: y.toString(), value: y.toString() };
            }),
          ]}
          placeholder="All Years"
          className="w-32"
        />
      </div>

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
