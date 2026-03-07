import api from "@/lib/api";
import type { ApiResponse, User, CustomMovie } from "@/types";

export const adminService = {
  // ── User management ─────────────────────────────────

  // GET /users
  getAllUsers: async () => {
    const res = await api.get<ApiResponse<User[]>>("/users");
    return res.data.data;
  },

  // GET /users/:id
  getUserById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  // PATCH /users/:id/ban
  banUser: async (id: string) => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/ban`);
    return res.data.data;
  },

  // PATCH /users/:id/unban
  unbanUser: async (id: string) => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/unban`);
    return res.data.data;
  },

  // DELETE /users/:id
  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  // PUT /users/profile  (authenticated user)
  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const res = await api.put<ApiResponse<User>>("/users/profile", data);
    return res.data.data;
  },

  // ── Custom movie management ─────────────────────────

  // GET /tmdb/movies/custom
  getAllMovies: async () => {
    const res = await api.get<ApiResponse<CustomMovie[]>>("/tmdb/movies/custom");
    return res.data.data;
  },

  // GET /tmdb/movies/custom/:id
  getMovieById: async (id: string) => {
    const res = await api.get<ApiResponse<CustomMovie>>(`/tmdb/movies/custom/${id}`);
    return res.data.data;
  },

  // POST /tmdb/movies/custom
  createMovie: async (data: Partial<CustomMovie>) => {
    const res = await api.post<ApiResponse<CustomMovie>>("/tmdb/movies/custom", data);
    return res.data.data;
  },

  // PUT /tmdb/movies/custom/:id
  updateMovie: async (id: string, data: Partial<CustomMovie>) => {
    const res = await api.put<ApiResponse<CustomMovie>>(`/tmdb/movies/custom/${id}`, data);
    return res.data.data;
  },

  // DELETE /tmdb/movies/custom/:id
  deleteMovie: async (id: string) => {
    await api.delete(`/tmdb/movies/custom/${id}`);
  },
};
