import { useAuthStore } from '@/store/auth.store';
import { HighlightResponse, CreateHighlightInput, highlightSchema } from '../schemas/highlight.schema';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const highlightsApi = {
    getHighlights: async (url: string): Promise<HighlightResponse[]> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/highlights?url=${encodeURIComponent(url)}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to fetch highlights');
        }
        const data = await res.json();
        return z.array(highlightSchema).parse(data.data);
    },

    createHighlight: async (data: CreateHighlightInput): Promise<HighlightResponse> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/highlights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create highlight');
        }
        const result = await res.json();
        return highlightSchema.parse(result.data);
    },

    deleteHighlight: async (id: string): Promise<void> => {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${API_URL}/highlights/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete highlight');
        }
    },
};
