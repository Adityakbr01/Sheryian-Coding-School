import { useAuthStore } from '@/store/auth.store';
import { CollectionResponse, CreateCollectionInput } from '../schemas/collection.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const collectionsApi = {
    getCollections: async (): Promise<CollectionResponse[]> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/collections`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to fetch collections');
        }
        const data = await res.json();
        return data.data;
    },

    createCollection: async (data: CreateCollectionInput): Promise<CollectionResponse> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/collections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create collection');
        }
        const result = await res.json();
        return result.data;
    },

    deleteCollection: async (id: string): Promise<void> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/collections/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete collection');
        }
    },
};
