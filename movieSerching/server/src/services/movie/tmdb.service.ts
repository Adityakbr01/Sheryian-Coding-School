import axios from "axios";
import { env } from "@/configs/env";
import { TMDB_MEDIA, TIME_WINDOW, MEDIA_TYPE } from "@/constants/mediaType";
import type { TmdbMedia, TimeWindow } from "@/constants/mediaType";
import logger from "@/utils/logger";

const tmdbApi = axios.create({
  baseURL: env.TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  },
});

// Log outgoing TMDB requests
tmdbApi.interceptors.request.use((config) => {
  logger.debug(`[TMDB] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, { params: config.params });
  return config;
});

// Log TMDB errors
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      logger.error(`[TMDB ERROR] ${error.response?.status} ${error.config?.url}`, {
        data: error.response?.data || error.message,
      });
    }
    return Promise.reject(error);
  }
);

export const getTrending = async (
  mediaType: TmdbMedia = TMDB_MEDIA.ALL,
  timeWindow: TimeWindow = TIME_WINDOW.DAY,
  page: number = 1
) => {
  const { data } = await tmdbApi.get(
    `/trending/${mediaType}/${timeWindow}`,
    { params: { page } }
  );
  return data;
};

export const getPopular = async (
  mediaType: TmdbMedia = MEDIA_TYPE.MOVIE,
  page: number = 1
) => {
  const { data } = await tmdbApi.get(`/${mediaType}/popular`, {
    params: { page },
  });
  return data;
};

export const getTopRated = async (
  mediaType: TmdbMedia = MEDIA_TYPE.MOVIE,
  page: number = 1
) => {
  const { data } = await tmdbApi.get(`/${mediaType}/top_rated`, {
    params: { page },
  });
  return data;
};

export const getMovieDetails = async (movieId: number) => {
  const { data } = await tmdbApi.get(`/movie/${movieId}`, {
    params: { append_to_response: "videos,credits,similar,recommendations" },
  });
  return data;
};

export const getTvDetails = async (tvId: number) => {
  const { data } = await tmdbApi.get(`/tv/${tvId}`, {
    params: { append_to_response: "videos,credits,similar,recommendations" },
  });
  return data;
};

export const searchMulti = async (query: string, page: number = 1) => {
  const { data } = await tmdbApi.get("/search/multi", {
    params: { query, page },
  });
  return data;
};

export const searchMovies = async (query: string, page: number = 1) => {
  const { data } = await tmdbApi.get("/search/movie", {
    params: { query, page },
  });
  return data;
};

export const searchTv = async (query: string, page: number = 1) => {
  const { data } = await tmdbApi.get("/search/tv", {
    params: { query, page },
  });
  return data;
};

export const searchPeople = async (query: string, page: number = 1) => {
  const { data } = await tmdbApi.get("/search/person", {
    params: { query, page },
  });
  return data;
};

export const getPersonDetails = async (personId: number) => {
  const { data } = await tmdbApi.get(`/person/${personId}`, {
    params: { append_to_response: "combined_credits,images" },
  });
  return data;
};

export const getMovieVideos = async (movieId: number) => {
  const { data } = await tmdbApi.get(`/movie/${movieId}/videos`);
  return data;
};

export const getTvVideos = async (tvId: number) => {
  const { data } = await tmdbApi.get(`/tv/${tvId}/videos`);
  return data;
};

export const getMovieImages = async (movieId: number) => {
  const { data } = await tmdbApi.get(`/movie/${movieId}/images`);
  return data;
};

export const discoverMovies = async (params: Record<string, any>) => {
  const { data } = await tmdbApi.get("/discover/movie", { params });
  return data;
};

export const discoverTv = async (params: Record<string, any>) => {
  const { data } = await tmdbApi.get("/discover/tv", { params });
  return data;
};

export const getGenres = async (mediaType: TmdbMedia = MEDIA_TYPE.MOVIE) => {
  const { data } = await tmdbApi.get(`/genre/${mediaType}/list`);
  return data;
};
