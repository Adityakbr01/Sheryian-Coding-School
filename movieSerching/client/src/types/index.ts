// Types for TMDB API responses and app state

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  media_type?: "movie" | "tv" | "person";
  original_language: string;
  adult: boolean;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: TMDBMovie[];
  media_type?: "person";
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetail extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime?: number;
  budget?: number;
  revenue?: number;
  status: string;
  tagline: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  videos: { results: TMDBVideo[] };
  credits: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
  similar: TMDBResponse<TMDBMovie>;
  recommendations: TMDBResponse<TMDBMovie>;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBPersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  combined_credits: {
    cast: TMDBMovie[];
    crew: TMDBMovie[];
  };
  images: {
    profiles: { file_path: string }[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

// App-specific types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CustomMovie {
  _id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  description: string;
  tmdbId?: number;
  releaseDate: string;
  trailerUrl?: string;
  genre: string[];
  category: "movie" | "tv" | "both";
  rating?: number;
  voteCount?: number;
  popularity?: number;
  originalLanguage?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  _id: string;
  userId: string;
  tmdbId?: number;
  movieId?: string;
  title: string;
  posterUrl: string;
  mediaType: "movie" | "tv";
  rating?: number;
  releaseDate?: string;
  createdAt: string;
}

export interface WatchHistoryItem {
  _id: string;
  userId: string;
  tmdbId?: number;
  movieId?: string;
  title: string;
  posterUrl: string;
  mediaType: "movie" | "tv";
  watchedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  total: number;
  totalPages: number;
  [key: string]: T[] | number;
}
