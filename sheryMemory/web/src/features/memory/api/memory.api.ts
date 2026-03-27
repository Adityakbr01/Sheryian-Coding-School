import Cookies from 'js-cookie';
import type { Item } from '../../items/types/items.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const memoryApi = {
  getResurfacedItems: async (): Promise<Item[]> => {
    const response = await fetch(`${API_URL}/memory/resurface`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch resurfaced items');
    }
    const json = await response.json();
    return json.data;
  },

  markItemReviewed: async (itemId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/memory/${itemId}/review`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to mark item reviewed');
    }
  }
};
