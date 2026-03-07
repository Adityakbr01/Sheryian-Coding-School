import api from "@/lib/api";
import type { ApiResponse, User } from "@/types";

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data.data;
  },
};
