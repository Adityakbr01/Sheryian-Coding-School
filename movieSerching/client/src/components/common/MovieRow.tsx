import { memo } from "react";
import { Link } from "react-router-dom";
import type { TMDBMovie } from "@/types";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  movies: TMDBMovie[];
  viewAllLink?: string;
  showMediaType?: boolean;
}

export default memo(function MovieRow({
  title,
  movies,
  viewAllLink,
  showMediaType,
}: MovieRowProps) {
  if (!movies.length) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-3xl font-juana tracking-wide text-foreground">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm text-[var(--custom-primary)] hover:text-foreground transition-colors"
          >
            View All &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4">
        {movies.slice(0, 12).map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            showMediaType={showMediaType}
          />
        ))}
      </div>
    </section>
  );
})
