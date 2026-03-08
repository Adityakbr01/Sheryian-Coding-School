import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiStar,
  HiPlay,
  HiHeart,
  HiOutlineHeart,
  HiClock,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchMovieDetail, clearDetail } from "@/store/slices/movieSlice";
import {
  addFavorite,
  removeFavoriteByTmdbId,
} from "@/store/slices/favoriteSlice";
import { addToHistory } from "@/store/slices/watchHistorySlice";
import {
  getBackdropUrl,
  getImageUrl,
  formatDate,
  formatRating,
  getMediaTitle,
  getMediaDate,
} from "@/lib/utils";
import TrailerModal from "@/components/common/TrailerModal";
import MovieCard from "@/components/common/MovieCard";
import MobileDetailDrawer from "@/components/common/MobileDetailDrawer";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { TMDBVideo, TMDBCast } from "@/types";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movieDetail: detail, isDetailLoading } = useAppSelector(
    (state) => state.movies,
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const type = location.pathname.startsWith("/tv") ? "tv" : "movie";
  const isFavorite = detail
    ? favorites.some((f) => f.tmdbId === detail.id)
    : false;

  useEffect(() => {
    if (id) {
      dispatch(
        fetchMovieDetail({ id: Number(id), type: type as "movie" | "tv" }),
      );
    }
    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id, type]);

  // Track watch history on detail view
  useEffect(() => {
    if (detail && isAuthenticated) {
      dispatch(
        addToHistory({
          tmdbId: detail.id,
          title: getMediaTitle(detail),
          posterUrl: detail.poster_path || "",
          mediaType: type as "movie" | "tv",
        }),
      );
    }
  }, [detail, isAuthenticated]);

  const handleTrailer = () => {
    if (!detail) return;
    const trailer = detail.videos?.results?.find(
      (v: TMDBVideo) => v.type === "Trailer" && v.site === "YouTube",
    );
    if (trailer) {
      setTrailerKey(trailer.key);
    } else {
      toast.error("No trailer available");
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add favorites");
      return;
    }
    if (!detail) return;

    try {
      if (isFavorite) {
        await dispatch(removeFavoriteByTmdbId(detail.id)).unwrap();
        toast.success("Removed from favorites");
      } else {
        await dispatch(
          addFavorite({
            tmdbId: detail.id,
            title: getMediaTitle(detail),
            posterUrl: detail.poster_path || "",
            mediaType: type as "movie" | "tv",
            rating: detail.vote_average,
            releaseDate: getMediaDate(detail),
          }),
        ).unwrap();
        toast.success("Added to favorites");
      }
    } catch (err) {
      // Handled by api interceptor
    }
  };

  if (isDetailLoading || !detail) return <Loader />;

  const title = getMediaTitle(detail);
  const date = getMediaDate(detail);
  const cast = detail.credits?.cast?.slice(0, 12) || [];
  const similar = detail.similar?.results?.slice(0, 6) || [];
  const recommendations = detail.recommendations?.results?.slice(0, 6) || [];

  return (
    <div className="pb-6">
      {/* Backdrop Hero */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getBackdropUrl(detail.backdrop_path)})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <HiArrowLeft size={20} />
        </button>
      </div>

      {/* Desktop Detail Content — hidden on mobile */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(detail.poster_path, "w500")}
              alt={title}
              className="w-48 md:w-72 rounded-xl shadow-lg border border-white/10 dark:border-white/5 bg-card object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 animate-fadeInUp">
            <h1 className="text-3xl md:text-5xl font-juana font-bold tracking-wide text-foreground mb-2">
              {title}
            </h1>

            {detail.tagline && (
              <p className="text-[var(--custom-accentColor)] italic mb-3 font-NeuMachina">
                {detail.tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-foreground/80">
              <span className="flex items-center gap-1">
                <HiStar className="text-yellow-400" />
                {formatRating(detail.vote_average)} (
                {detail.vote_count?.toLocaleString()} votes)
              </span>
              {date && <span>{formatDate(date)}</span>}
              {detail.runtime && <span>{detail.runtime} min</span>}
              {detail.number_of_seasons && (
                <span>
                  {detail.number_of_seasons} Season
                  {detail.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
              <span className="bg-[var(--custom-primary)]/10 text-[var(--custom-primary)] border border-[var(--custom-primary)]/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                {type}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4 font-NeuMachina">
              {detail.genres?.map((g) => (
                <span
                  key={g.id}
                  className="bg-black/5 dark:bg-white/10 border border-border/20 text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl font-HelveticaNow text-justify">
              {detail.overview || "No overview available."}
            </p>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleTrailer}
                className="btn-primary flex items-center gap-2 cursor-pointer"
              >
                <HiPlay size={20} /> Watch Trailer
              </button>
              <button
                onClick={handleFavorite}
                className="btn-secondary flex items-center gap-2 cursor-pointer"
              >
                {isFavorite ? (
                  <HiHeart className="text-red-500" />
                ) : (
                  <HiOutlineHeart />
                )}
                {isFavorite ? "Remove Favorite" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-juana tracking-wide text-foreground mb-4">
              Cast
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {cast.map((member: TMDBCast) => (
                <Link
                  key={member.id}
                  to={`/person/${member.id}`}
                  className="group text-center"
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden mb-2 bg-gray-800">
                    <img
                      src={getImageUrl(member.profile_path, "w185")}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors mt-2 font-NeuMachina">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-HelveticaNow">
                    {member.character}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-juana tracking-wide text-foreground mb-4">
              Similar
            </h2>
            {/* Mobile view (Swiper) */}
            <div className="block md:hidden pb-4">
              <Swiper spaceBetween={16} slidesPerView={1.2} className="w-full">
                {similar.map((m) => (
                  <SwiperSlide key={m.id}>
                    <MovieCard movie={{ ...m, media_type: type as any }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop view (Grid) */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
              {similar.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={{ ...m, media_type: type as any }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="text-2xl font-juana tracking-wide text-foreground mb-4">
              Recommendations
            </h2>
            {/* Mobile view (Swiper) */}
            <div className="block md:hidden pb-4">
              <Swiper spaceBetween={16} slidesPerView={1.2} className="w-full">
                {recommendations.map((m) => (
                  <SwiperSlide key={m.id}>
                    <MovieCard movie={{ ...m, media_type: type as any }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop view (Grid) */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
              {recommendations.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={{ ...m, media_type: type as any }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Detail Drawer — shown only on mobile */}
      <MobileDetailDrawer
        detail={detail}
        type={type as "movie" | "tv"}
        isFavorite={isFavorite}
        similar={similar}
        recommendations={recommendations}
        onTrailer={handleTrailer}
        onFavorite={handleFavorite}
      />

      {/* Trailer Modal */}
      {trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={title}
          onClose={() => setTrailerKey(null)}
        />
      )}
    </div>
  );
}
