import axios from 'axios';
import { Platform } from 'react-native';

import { getItem, STORAGE_KEYS } from './storage';

const API_URL = Platform.OS === 'android' ? 'http://10.115.15.27:3001/api/v1' : 'http://localhost:3001/api/v1'; // For Emulator. Replace with actual IP for physical device.

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
