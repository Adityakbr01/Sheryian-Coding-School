import { Link } from "react-router-dom";
import { HiPlay, HiInformationCircle } from "react-icons/hi";
import FlipText from "@/components/common/FlipText";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  EffectCoverflow,
  Keyboard,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import { getBackdropUrl, getMediaTitle, getMediaDate } from "@/lib/utils";
import type { TMDBMovie } from "@/types";

interface HeroCarouselProps {
  movies: TMDBMovie[];
  onPlayTrailer: (movie: TMDBMovie) => void;
}

export default function HeroCarousel({
  movies,
  onPlayTrailer,
}: HeroCarouselProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="w-full relative bg-background px-2 md:pb-10 pt-6 md:pt-4">
      <Swiper
        modules={[Autoplay, Pagination, EffectCoverflow, Keyboard]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        speed={800}
        keyboard={{ enabled: true }}
        spaceBetween={25}
        coverflowEffect={{
          rotate: 0,
          stretch: -25,
          depth: 50,
          modifier: 1,
          slideShadows: false,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="w-full hero-swiper pb-12! group/carousel"
      >
        {movies.slice(0, 8).map((movie) => (
          <SwiperSlide
            key={movie.id}
            className="w-[95%] sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-6xl group/slide"
          >
            {({ isActive }) => (
              <div
                className={`relative h-[60vh] md:h-[65vh] rounded-[2rem] overflow-hidden border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                group-has-[.is-active:hover]/carousel:blur-[4px] group-has-[.is-active:hover]/carousel:grayscale-[40%] group-has-[.is-active:hover]/carousel:brightness-60 group-has-[.is-active:hover]/carousel:opacity-30 group-has-[.is-active:hover]/carousel:scale-95
                hover:group-has-[.is-active:hover]/carousel:!blur-none hover:group-has-[.is-active:hover]/carousel:!grayscale-0 hover:group-has-[.is-active:hover]/carousel:!brightness-100 hover:group-has-[.is-active:hover]/carousel:!opacity-100 hover:group-has-[.is-active:hover]/carousel:scale-[1.015] hover:group-has-[.is-active:hover]/carousel:dark:shadow-[0_0_100px_rgba(0,0,0,0.8),0_25px_60px_rgba(0,0,0,0.5)]
                ${
                  isActive
                    ? "is-active opacity-100 dark:shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_30px_rgba(0,0,0,0.4)]"
                    : "opacity-55 grayscale-[20%] shadow-none"
                }`}
              >
                {/* Background image */}
                <img
                  src={getBackdropUrl(movie.backdrop_path)}
                  alt={getMediaTitle(movie)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  fetchPriority="high"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col justify-end text-foreground transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-[.is-active]:group-hover/slide:-translate-y-2">
                  {/* Badge */}
                  {movie.media_type && (
                    <div className="mb-3">
                      <span className="bg-[var(--custom-primary)]/90 text-primary-foreground dark:text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(27,209,166,0.4)]">
                        {movie.media_type === "tv" ? "TV Series" : "Movie"}
                      </span>
                    </div>
                  )}

                  <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-juana font-bold mb-3 drop-shadow-2xl tracking-wide leading-tight line-clamp-2">
                    {getMediaTitle(movie)}
                  </h1>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-4 text-xs md:text-sm font-HelveticaNow">
                    <span className="flex items-center gap-1 font-bold text-yellow-500 dark:text-yellow-400 text-sm md:text-base">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-foreground/40" />
                    <span className="text-foreground/80 font-medium">
                      {getMediaDate(movie)
                        ? new Date(getMediaDate(movie)).getFullYear()
                        : ""}
                    </span>
                  </div>

                  <p className="text-foreground/80 font-medium max-w-xl text-xs md:text-[0.95rem] mb-6 md:mb-7 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <button
                      onClick={() => onPlayTrailer(movie)}
                      className="group btn-primary text-xs md:text-sm flex items-center gap-1.5 md:gap-2 border-none ring-offset-background"
                    >
                      <HiPlay className="text-primary-foreground dark:text-white w-4 h-4 md:w-5 md:h-5 z-10" />{" "}
                      <FlipText hoverClassName="text-white/80">
                        Watch Trailer
                      </FlipText>
                    </button>
                    <Link
                      to={`/${movie.media_type === "tv" ? "tv" : "movie"}/${movie.id}`}
                      className="group btn-secondary text-xs md:text-sm flex items-center gap-1.5 md:gap-2 border border-foreground/20 text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-md"
                    >
                      <HiInformationCircle className="w-4 h-4 md:w-5 md:h-5 z-10" />
                      <FlipText hoverClassName="text-foreground/80">
                        More Info
                      </FlipText>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* ── Pagination ── */
        .hero-swiper .swiper-pagination {
          bottom: 10px !important;
        }
        @media (min-width: 768px) {
          .hero-swiper .swiper-pagination {
            bottom: 20px !important;
          }
        }
        .hero-swiper .swiper-pagination-bullet {
          background-color: var(--foreground) !important;
          opacity: 0.3;
          width: 6px;
          height: 6px;
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
          .hero-swiper .swiper-pagination-bullet {
             width: 8px;
             height: 8px;
          }
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background-color: var(--custom-accentColor) !important;
          opacity: 1;
          width: 18px;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(232,96,46,0.8);
        }
        @media (min-width: 768px) {
           .hero-swiper .swiper-pagination-bullet-active {
             width: 24px;
           }
        }
      `}</style>
    </div>
  );
}
