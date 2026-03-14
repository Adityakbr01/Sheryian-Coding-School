import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.115.15.27:3001/api/v1' : 'http://localhost:3001/api/v1'; // For Emulator. Replace with actual IP for physical device.

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
