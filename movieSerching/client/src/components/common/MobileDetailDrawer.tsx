import {
  formatRating,
  getImageUrl,
  getMediaDate,
  getMediaTitle,
  getMediaType,
} from "@/lib/utils";
import type { TMDBCast, TMDBMovie, TMDBMovieDetail } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiChevronUp,
  HiHeart,
  HiOutlineHeart,
  HiPlay,
  HiStar,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

interface MobileDetailDrawerProps {
  detail: TMDBMovieDetail;
  type: "movie" | "tv";
  isFavorite: boolean;
  similar: TMDBMovie[];
  recommendations: TMDBMovie[];
  onTrailer: () => void;
  onFavorite: () => void;
}

type DrawerState = "collapsed" | "peek" | "full";

/* Height breakpoints (vh) for each state */
const SNAP_COLLAPSED = 8; // ~8vh
const SNAP_PEEK = 55; // ~55vh
/* Full state: leave room for navbar (5rem = 80px on mobile) */
const NAVBAR_HEIGHT_PX = 80;

function getSnapHeight(state: DrawerState): string {
  if (state === "collapsed") return `${SNAP_COLLAPSED}vh`;
  if (state === "peek") return `${SNAP_PEEK}vh`;
  return `calc(100vh - ${NAVBAR_HEIGHT_PX}px)`;
}

export default function MobileDetailDrawer({
  detail,
  type,
  isFavorite,
  similar,
  recommendations,
  onTrailer,
  onFavorite,
}: MobileDetailDrawerProps) {
  const [drawerState, setDrawerState] = useState<DrawerState>("peek");
  const [dragOffset, setDragOffset] = useState(0); // px offset while dragging
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const title = getMediaTitle(detail);
  const date = getMediaDate(detail);
  const cast = detail.credits?.cast?.slice(0, 10) || [];

  /* ——— Touch gesture handling with live drag feedback ——— */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // If content is scrolled, only allow downward swipe from top
      if (
        drawerState === "full" &&
        contentRef.current &&
        contentRef.current.scrollTop > 0
      ) {
        return;
      }
      startY.current = e.touches[0].clientY;
      startHeight.current = drawerRef.current?.offsetHeight ?? 0;
      setIsDragging(true);
    },
    [drawerState],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      // Prevent native scroll while dragging the handle area
      if (
        contentRef.current &&
        contentRef.current.scrollTop <= 0 &&
        e.touches[0].clientY > startY.current
      ) {
        e.preventDefault();
      }
      const diff = startY.current - e.touches[0].clientY;
      setDragOffset(diff);
    },
    [isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 40;
    const diff = dragOffset;
    setDragOffset(0);

    if (diff > threshold) {
      // Swiped up
      setDrawerState((prev) =>
        prev === "collapsed" ? "peek" : prev === "peek" ? "full" : "full",
      );
    } else if (diff < -threshold) {
      // Swiped down
      setDrawerState((prev) =>
        prev === "full" ? "peek" : prev === "peek" ? "collapsed" : "collapsed",
      );
    }
  }, [isDragging, dragOffset]);

  const cycleDrawer = () => {
    setDrawerState((prev) => (prev === "full" ? "peek" : "full"));
  };

  /* Lock body scroll when fully expanded */
  useEffect(() => {
    if (drawerState === "full") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerState]);

  /* Scroll content back to top when leaving full state */
  useEffect(() => {
    if (drawerState !== "full" && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [drawerState]);

  /* Compute height: snap + live drag offset */
  const maxDrawerPx =
    typeof window !== "undefined"
      ? window.innerHeight - NAVBAR_HEIGHT_PX
      : 600;

  const getBaseHeightPx = () => {
    if (drawerState === "collapsed")
      return (SNAP_COLLAPSED / 100) * window.innerHeight;
    if (drawerState === "peek")
      return (SNAP_PEEK / 100) * window.innerHeight;
    return maxDrawerPx;
  };

  const baseHeightPx =
    typeof window !== "undefined" ? getBaseHeightPx() : 0;
  const liveHeight = isDragging
    ? Math.max(50, Math.min(maxDrawerPx, baseHeightPx + dragOffset))
    : undefined;

  const heightStyle = liveHeight
    ? { height: `${liveHeight}px` }
    : { height: getSnapHeight(drawerState) };

  return (
    <div
      ref={drawerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={heightStyle}
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${
        isDragging ? "" : "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      }`}
    >
      {/* Backdrop when fully expanded */}
      {drawerState === "full" && (
        <div
          className="fixed inset-0 bg-black/50 -z-10 animate-fadeIn"
          onClick={() => setDrawerState("peek")}
        />
      )}

      <div className="h-full bg-background/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-[0_-4px_40px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden">
        {/* Drag Handle */}
        <button
          onClick={cycleDrawer}
          className="flex flex-col items-center pt-2.5 pb-2 cursor-pointer flex-shrink-0 touch-none"
          aria-label="Toggle drawer"
        >
          <div className="w-9 h-1 rounded-full bg-muted-foreground/40 mb-1" />
          <HiChevronUp
            className={`text-muted-foreground/60 transition-transform duration-300 ${
              drawerState === "full" ? "rotate-180" : ""
            }`}
            size={16}
          />
        </button>

        {/* Collapsed: Compact title bar */}
        {drawerState === "collapsed" && (
          <div className="px-4 pb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={getImageUrl(detail.poster_path, "w92")}
                alt={title}
                className="w-8 h-11 rounded object-cover flex-shrink-0"
              />
              <h3 className="text-sm font-bold text-foreground truncate font-NeuMachina">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <HiStar className="text-yellow-400" size={12} />
                {formatRating(detail.vote_average)}
              </span>
              <button
                onClick={onTrailer}
                className="p-1.5 rounded-full bg-[var(--custom-primary)] text-white cursor-pointer"
                aria-label="Play trailer"
              >
                <HiPlay size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Peek & Full: Scrollable content */}
        {drawerState !== "collapsed" && (
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8"
          >
            {/* Quick info row */}
            <div className="flex items-start gap-4 mb-4">
              <img
                src={getImageUrl(detail.poster_path, "w185")}
                alt={title}
                className="w-20 h-[118px] rounded-xl object-cover flex-shrink-0 shadow-lg ring-1 ring-white/10"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground font-juana leading-tight mb-0.5">
                  {title}
                </h2>

                {detail.tagline && (
                  <p className="text-[var(--custom-accentColor)] text-[11px] italic mb-1.5 font-NeuMachina line-clamp-1">
                    "{detail.tagline}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-0.5 text-yellow-400 font-semibold">
                    <HiStar size={13} />
                    {formatRating(detail.vote_average)}
                  </span>
                  <span className="text-muted-foreground/40">|</span>
                  {date && <span>{new Date(date).getFullYear()}</span>}
                  {detail.runtime ? (
                    <>
                      <span className="text-muted-foreground/40">|</span>
                      <span>{detail.runtime}m</span>
                    </>
                  ) : null}
                  {detail.number_of_seasons && (
                    <>
                      <span className="text-muted-foreground/40">|</span>
                      <span>
                        {detail.number_of_seasons} Season
                        {detail.number_of_seasons > 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5">
                  {detail.genres?.slice(0, 3).map((g) => (
                    <span
                      key={g.id}
                      className="bg-[var(--custom-primary)]/10 text-[var(--custom-primary)] text-[10px] px-2 py-0.5 rounded-full font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                  {(detail.genres?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground/60 self-center">
                      +{(detail.genres?.length ?? 0) - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={onTrailer}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5 !py-2.5 !text-sm !rounded-xl cursor-pointer"
              >
                <HiPlay size={16} /> Watch Trailer
              </button>
              <button
                onClick={onFavorite}
                className={`flex items-center justify-center gap-1.5 !py-2.5 !px-5 !text-sm !rounded-xl cursor-pointer transition-colors ${
                  isFavorite
                    ? "bg-red-500/15 text-red-500 border border-red-500/30"
                    : "btn-secondary"
                }`}
              >
                {isFavorite ? (
                  <HiHeart size={16} />
                ) : (
                  <HiOutlineHeart size={16} />
                )}
              </button>
            </div>

            {/* Overview */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-1.5 font-NeuMachina">
                Overview
              </h3>
              <p
                className={`text-xs text-muted-foreground leading-relaxed font-HelveticaNow ${
                  drawerState === "peek" ? "line-clamp-4" : ""
                }`}
              >
                {detail.overview || "No overview available."}
              </p>
              {drawerState === "peek" && detail.overview && detail.overview.length > 200 && (
                <button
                  onClick={() => setDrawerState("full")}
                  className="text-[var(--custom-primary)] text-[11px] font-medium mt-1 cursor-pointer"
                >
                  Read more
                </button>
              )}
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-2 font-NeuMachina">
                  Cast
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {cast
                    .slice(0, drawerState === "full" ? 10 : 5)
                    .map((member: TMDBCast) => (
                      <Link
                        key={member.id}
                        to={`/person/${member.id}`}
                        className="flex-shrink-0 text-center w-[56px] group"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted mb-1 ring-2 ring-transparent group-hover:ring-[var(--custom-primary)] transition-all">
                          <img
                            src={getImageUrl(member.profile_path, "w185")}
                            alt={member.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
                          {member.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {member.character}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Similar Movies — always visible when data exists */}
            {similar.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-2 font-NeuMachina">
                  Similar
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {similar
                    .slice(0, drawerState === "full" ? 10 : 6)
                    .map((m) => (
                      <Link
                        key={m.id}
                        to={`/${type}/${m.id}`}
                        className="flex-shrink-0 w-28 group"
                      >
                        <div className="w-28 h-[168px] rounded-lg overflow-hidden bg-muted mb-1.5 ring-1 ring-white/5 group-hover:ring-[var(--custom-primary)]/50 transition-all">
                          <img
                            src={getImageUrl(m.poster_path, "w185")}
                            alt={getMediaTitle(m)}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors font-NeuMachina">
                          {getMediaTitle(m)}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <HiStar className="text-yellow-400" size={10} />
                          {formatRating(m.vote_average)}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-2 font-NeuMachina">
                  Recommendations
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recommendations
                    .slice(0, drawerState === "full" ? 10 : 6)
                    .map((m) => (
                      <Link
                        key={m.id}
                        to={`/${getMediaType(m) || type}/${m.id}`}
                        className="flex-shrink-0 w-28 group"
                      >
                        <div className="w-28 h-[168px] rounded-lg overflow-hidden bg-muted mb-1.5 ring-1 ring-white/5 group-hover:ring-[var(--custom-primary)]/50 transition-all">
                          <img
                            src={getImageUrl(m.poster_path, "w185")}
                            alt={getMediaTitle(m)}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors font-NeuMachina">
                          {getMediaTitle(m)}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <HiStar className="text-yellow-400" size={10} />
                          {formatRating(m.vote_average)}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Extra details — full state only */}
            {drawerState === "full" && (
              <div className="space-y-3 pt-2 border-t border-border/30">
                {detail.genres && detail.genres.length > 3 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1 font-NeuMachina">
                      All Genres
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.genres.map((g) => (
                        <span
                          key={g.id}
                          className="bg-[var(--custom-primary)]/10 text-[var(--custom-primary)] text-xs px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detail.production_companies &&
                  detail.production_companies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1 font-NeuMachina">
                        Production
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {detail.production_companies
                          .map((c) => c.name)
                          .join(" · ")}
                      </p>
                    </div>
                  )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                  {detail.status && (
                    <div>
                      <span className="font-bold text-foreground font-NeuMachina">
                        Status
                      </span>
                      <p className="text-muted-foreground">{detail.status}</p>
                    </div>
                  )}
                  {type === "movie" && detail.budget && detail.budget > 0 && (
                    <div>
                      <span className="font-bold text-foreground font-NeuMachina">
                        Budget
                      </span>
                      <p className="text-muted-foreground">
                        ${detail.budget.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {type === "movie" && detail.revenue && detail.revenue > 0 && (
                    <div>
                      <span className="font-bold text-foreground font-NeuMachina">
                        Revenue
                      </span>
                      <p className="text-muted-foreground">
                        ${detail.revenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
