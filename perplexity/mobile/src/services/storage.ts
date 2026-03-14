import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage key constants
export const STORAGE_KEYS = {
  THEME: 'user_theme_preference',
  AUTH_TOKEN: 'auth_token',
  USER: 'user'
};

/**
 * Save a value to secure storage
 */
export async function saveItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Local storage is not available:', e);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

/**
 * Retrieve a value from secure storage
 */
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Local storage is not available:', e);
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

/**
 * Delete a value from secure storage
 */
export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Local storage is not available:', e);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
