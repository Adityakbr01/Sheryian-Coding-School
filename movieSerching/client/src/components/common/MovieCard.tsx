import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  formatRating,
  getImageUrl,
  getMediaDate,
  getMediaTitle,
  getMediaType,
} from "@/lib/utils";
import {
  addFavorite,
  removeFavoriteByTmdbId,
} from "@/store/slices/favoriteSlice";
import type { TMDBMovie } from "@/types";
import { memo } from "react";
import toast from "react-hot-toast";
import { HiHeart, HiOutlineHeart, HiStar } from "react-icons/hi";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: TMDBMovie;
  showMediaType?: boolean;
}

export default memo(function MovieCard({
  movie,
  showMediaType = false,
}: MovieCardProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: favorites } = useAppSelector((state) => state.favorites);

  const title = getMediaTitle(movie);
  const date = getMediaDate(movie);
  const type = getMediaType(movie);
  const isFavorite = favorites.some((f) => f.tmdbId === movie.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add favorites");
      return;
    }

    try {
      if (isFavorite) {
        await dispatch(removeFavoriteByTmdbId(movie.id)).unwrap();
        toast.success("Removed from favorites");
      } else {
        await dispatch(
          addFavorite({
            tmdbId: movie.id,
            title,
            posterUrl: movie.poster_path || "",
            mediaType: type,
            rating: movie.vote_average,
            releaseDate: date,
          }),
        ).unwrap();
        toast.success("Added to favorites");
      }
    } catch (err) {
      // Handled by api interceptor
    }
  };

  return (
    <Link to={`/${type}/${movie.id}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-card border dark:border-white/5 border-black/15">
        {/* Image */}
        <div className="aspect-[2/3] overflow-hidden relative">
          <img
            src={getImageUrl(movie.poster_path)}
            alt={title}
            loading="lazy"
            width={342}
            height={513}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
              <HiStar className="text-yellow-400 text-xs" />
              <span className="text-xs font-medium text-white">
                {formatRating(movie.vote_average)}
              </span>
            </div>
          )}

          {/* Media type badge */}
          {showMediaType && (
            <div className="absolute top-2 right-2 bg-[var(--custom-accentColor)]/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-lg">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {type}
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 cursor-pointer"
          >
            {isFavorite ? (
              <HiHeart className="text-red-500 text-lg" />
            ) : (
              <HiOutlineHeart className="text-white text-lg" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors font-NeuMachina">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground font-HelveticaNow">
              {date ? new Date(date).getFullYear() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
