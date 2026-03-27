import Cookies from 'js-cookie';
import type { Item } from '../types/items.types';

const API_URL = 'http://localhost:5000/api'; // Or your backend URL

const getHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const itemsApi = {
  save: async (url: string, collectionId?: string): Promise<{ data: Item }> => {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url, collectionId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save item');
    }
    return response.json();
  },

  get: async (id: string): Promise<{ data: Item }> => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch item');
    }
    return response.json();
  },

  list: async (collectionId?: string): Promise<{ data: Item[] }> => {
    const url = new URL(`${API_URL}/items`);
    if (collectionId) url.searchParams.append('collectionId', collectionId);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch items');
    }
    return response.json();
  },

  search: async (query: string, limit?: number): Promise<{ data: Item[] }> => {
    const url = new URL(`${API_URL}/items/search`);
    url.searchParams.append('q', query);
    if (limit) url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search items');
    }
    return response.json();
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete item');
    }
  }
};
