import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ── Request interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Token is stored in cookies by the backend,
    // `withCredentials: true` handles it automatically.
    // If a Bearer token is needed later, attach it here:
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data, // unwrap axios envelope, return API body directly
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    // Centralised 401 handler — redirect to login if unauthenticated
    if (error.response?.status === 401) {
      // Only redirect when NOT already on an auth page
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login'
      }
    }

    return Promise.reject({ message, status: error.response?.status })
  },
)

export default api
