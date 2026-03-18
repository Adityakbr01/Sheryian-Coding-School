import axios from 'axios';

// Create a configured axios instance
// In a real app, baseURL would come from import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for consistent error handling or data unwrapping
api.interceptors.response.use(
    (response) => {
        // Our backend returns { success: true, data: ... }
        // We can unwrap it here if we want, or do it in the service layer.
        // Let's keep it standard here and return the full response.
        return response;
    },
    (error) => {
        // Handle global errors (e.g. 401 Unauthorized, Network items)
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default api;
