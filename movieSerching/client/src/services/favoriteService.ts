import api from "@/lib/api";
import type { ApiResponse, FavoriteItem } from "@/types";

export const favoriteService = {
  getFavorites: async () => {
    const res = await api.get<ApiResponse<FavoriteItem[]>>("/favorites");
    return res.data.data;
  },

  addFavorite: async (data: {
    tmdbId?: number;
    movieId?: string;
    title: string;
    posterUrl: string;
    mediaType: "movie" | "tv";
    rating?: number;
    releaseDate?: string;
  }) => {
    const res = await api.post<ApiResponse<FavoriteItem>>("/favorites", data);
    return res.data.data;
  },

  removeFavorite: async (id: string) => {
    await api.delete(`/favorites/${id}`);
  },

  removeFavoriteByTmdbId: async (tmdbId: number) => {
    await api.delete(`/favorites/tmdb/${tmdbId}`);
  },

  checkIsFavorite: async (tmdbId: number) => {
    const res = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/check/${tmdbId}`);
    return res.data.data.isFavorite;
  },
};
