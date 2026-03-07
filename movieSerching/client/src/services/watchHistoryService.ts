import api from "@/lib/api";
import type { ApiResponse, WatchHistoryItem } from "@/types";

export const watchHistoryService = {
  getHistory: async () => {
    const res = await api.get<ApiResponse<WatchHistoryItem[]>>("/watch-history");
    return res.data.data;
  },

  addToHistory: async (data: {
    tmdbId?: number;
    movieId?: string;
    title: string;
    posterUrl: string;
    mediaType: "movie" | "tv";
  }) => {
    const res = await api.post<ApiResponse<WatchHistoryItem>>("/watch-history", data);
    return res.data.data;
  },

  // DELETE /watch-history/clear
  clearHistory: async () => {
    await api.delete("/watch-history/clear");
  },
};
