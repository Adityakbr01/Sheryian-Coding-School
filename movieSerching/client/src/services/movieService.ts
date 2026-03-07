import api from "@/lib/api";
import type { ApiResponse, TMDBMovie, TMDBPerson, TMDBMovieDetail, TMDBPersonDetail, TMDBResponse, Genre } from "@/types";

const BASE = "/tmdb/movies";

export const movieService = {
  // GET /tmdb/movies/trending/:mediaType/:timeWindow
  getTrending: async (media: string = "all", time: string = "day") => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/trending/${media}/${time}`);
    return res.data.data;
  },

  // GET /tmdb/movies/popular/:mediaType
  getPopular: async (type: string = "movie", page: number = 1) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/popular/${type}`, { params: { page } });
    return res.data.data;
  },

  // GET /tmdb/movies/top-rated/:mediaType
  getTopRated: async (type: string = "movie", page: number = 1) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/top-rated/${type}`, { params: { page } });
    return res.data.data;
  },

  // GET /tmdb/movies/details/movie/:id  or  /tmdb/movies/details/tv/:id
  getDetail: async (id: number, type: "movie" | "tv") => {
    const res = await api.get<ApiResponse<TMDBMovieDetail>>(`${BASE}/details/${type}/${id}`);
    return res.data.data;
  },

  // GET /tmdb/movies/person/:id
  getPersonDetail: async (id: number) => {
    const res = await api.get<ApiResponse<TMDBPersonDetail>>(`${BASE}/person/${id}`);
    return res.data.data;
  },

  // GET /tmdb/movies/search/multi
  searchMulti: async (query: string, page: number = 1, opts?: { signal?: AbortSignal }) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/search/multi`, {
      params: { query, page },
      signal: opts?.signal,
    });
    return res.data.data;
  },

  // GET /tmdb/movies/search/movie
  searchMovies: async (query: string, page: number = 1, opts?: { signal?: AbortSignal }) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/search/movie`, {
      params: { query, page },
      signal: opts?.signal,
    });
    return res.data.data;
  },

  // GET /tmdb/movies/search/tv
  searchTv: async (query: string, page: number = 1, opts?: { signal?: AbortSignal }) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/search/tv`, {
      params: { query, page },
      signal: opts?.signal,
    });
    return res.data.data;
  },

  // GET /tmdb/movies/search/person
  searchPeople: async (query: string, page: number = 1, opts?: { signal?: AbortSignal }) => {
    const res = await api.get<ApiResponse<TMDBResponse<TMDBPerson>>>(`${BASE}/search/person`, {
      params: { query, page },
      signal: opts?.signal,
    });
    return res.data.data;
  },

  // GET /tmdb/movies/genres/:mediaType
  getGenres: async (type: "movie" | "tv" = "movie") => {
    const res = await api.get<ApiResponse<{ genres: Genre[] }>>(`${BASE}/genres/${type}`);
    return res.data.data.genres;
  },

  // GET /tmdb/movies/discover/movie  or  /tmdb/movies/discover/tv
  discover: async (params: {
    type?: string;
    page?: number;
    genre?: string;
    sortBy?: string;
    year?: string;
  }) => {
    const type = params.type || "movie";
    const res = await api.get<ApiResponse<TMDBResponse<TMDBMovie>>>(`${BASE}/discover/${type}`, {
      params: {
        page: params.page || 1,
        with_genres: params.genre,
        sort_by: params.sortBy,
        year: params.year,
      },
    });
    return res.data.data;
  },

  // GET /tmdb/movies/videos/movie/:id  or  /tmdb/movies/videos/tv/:id
  getVideos: async (id: number, type: "movie" | "tv") => {
    const res = await api.get<ApiResponse<{ results: any[] }>>(`${BASE}/videos/${type}/${id}`);
    return res.data.data;
  },
};
