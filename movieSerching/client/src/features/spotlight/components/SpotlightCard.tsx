import { useState } from "react";
import { Link } from "react-router-dom";
import { HiStar, HiPlay, HiFilm, HiDesktopComputer, HiX } from "react-icons/hi";
import type { CustomMovie } from "@/types";

// Helper to extract YouTube ID from standard formats
function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface SpotlightCardProps {
  movie: CustomMovie;
}

export default function SpotlightCard({ movie }: SpotlightCardProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const ytId = movie.trailerUrl ? extractYouTubeId(movie.trailerUrl) : null;
  const categoryIcon =
    movie.category === "tv" ? (
      <HiDesktopComputer className="text-green-400 text-xs" />
    ) : (
      <HiFilm className="text-blue-400 text-xs" />
    );

  const categoryLabel =
    movie.category === "both"
      ? "Movie & TV"
      : movie.category === "tv"
        ? "TV Show"
        : "Movie";

  return (
    <Link
      to={`/${movie.category === "tv" ? "tv" : "movie"}/${movie.tmdbId || movie._id}`}
      className="group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:border-(--custom-primary)/40 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 flex flex-col"
    >
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <HiFilm className="text-4xl" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
          {categoryIcon}
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {categoryLabel}
          </span>
        </div>

        {/* Rating */}
        {movie.rating && movie.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
            <HiStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-medium text-white">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Trailer button */}
        {movie.trailerUrl && ytId && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTrailer(true);
              }}
              aria-label="Watch trailer"
            >
              <HiPlay className="text-white text-2xl" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-(--custom-primary) transition-colors font-NeuMachina mb-1">
          {movie.title}
        </h3>
        {movie.releaseDate && (
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(movie.releaseDate).getFullYear()}
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
          {movie.description}
        </p>
        {/* Genres */}
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {movie.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* YouTube Modal */}
      {showTrailer && ytId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <HiX className="text-xl" />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        </div>
      )}
    </Link>
  );
}
