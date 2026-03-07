/**
 * Centralized media-type constants used across models, services, and controllers.
 *
 * MEDIA_TYPE  — the two core types: "movie" | "tv"
 * CATEGORY    — superset used for admin-added movies: "movie" | "tv" | "both"
 * TMDB_MEDIA  — types returned by the TMDB API: "movie" | "tv" | "person"
 * TIME_WINDOW — TMDB trending time windows: "day" | "week"
 */

export const MEDIA_TYPE = {
  MOVIE: "movie",
  TV: "tv",
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

/** All valid MEDIA_TYPE values as an array (useful for Mongoose enums, Zod, etc.) */
export const MEDIA_TYPE_VALUES = Object.values(MEDIA_TYPE) as [MediaType, ...MediaType[]];

// ── Category (extends MediaType with "both") ────────────────────────────

export const CATEGORY = {
  ...MEDIA_TYPE,
  BOTH: "both",
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export const CATEGORY_VALUES = Object.values(CATEGORY) as [Category, ...Category[]];

// ── TMDB-specific media types (includes "person") ───────────────────────

export const TMDB_MEDIA = {
  ...MEDIA_TYPE,
  PERSON: "person",
  ALL: "all",
} as const;

export type TmdbMedia = (typeof TMDB_MEDIA)[keyof typeof TMDB_MEDIA];

export const TMDB_MEDIA_VALUES = Object.values(TMDB_MEDIA) as [TmdbMedia, ...TmdbMedia[]];

// ── TMDB trending time-window ───────────────────────────────────────────

export const TIME_WINDOW = {
  DAY: "day",
  WEEK: "week",
} as const;

export type TimeWindow = (typeof TIME_WINDOW)[keyof typeof TIME_WINDOW];

export const TIME_WINDOW_VALUES = Object.values(TIME_WINDOW) as [TimeWindow, ...TimeWindow[]];
