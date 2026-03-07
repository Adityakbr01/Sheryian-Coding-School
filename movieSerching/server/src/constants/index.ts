// ── Re-exports from dedicated constant files ───────────────────────────
export { HTTP_STATUS, type HttpStatusCode } from "./httpStatus";
export { STATUS_MESSAGES, getStatusMessage } from "./statusMessages";
export {
  MEDIA_TYPE,
  MEDIA_TYPE_VALUES,
  CATEGORY,
  CATEGORY_VALUES,
  TMDB_MEDIA,
  TMDB_MEDIA_VALUES,
  TIME_WINDOW,
  TIME_WINDOW_VALUES,
  type MediaType,
  type Category,
  type TmdbMedia,
  type TimeWindow,
} from "./mediaType";

// ── Inline constants ────────────────────────────────────────────────────

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western",
] as const;

export type Genre = (typeof GENRES)[number];
