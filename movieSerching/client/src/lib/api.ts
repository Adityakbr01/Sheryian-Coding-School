import axios from "axios";
import { API_BASE_URL } from "@/constants";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
    } else if (error.response?.data?.message && !isAuthRoute) {
      toast.error(error.response.data.message);
    }
    // Network errors and other failures are handled by in-page ErrorState UI
    return Promise.reject(error);
  }
);

export default api;
