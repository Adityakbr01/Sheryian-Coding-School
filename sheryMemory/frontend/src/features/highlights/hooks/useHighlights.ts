import { useState, useCallback } from 'react';
import { highlightsApi } from '../api/highlights.api';
import { HighlightResponse, CreateHighlightInput } from '../schemas/highlight.schema';

export function useHighlights(url: string) {
    const [highlights, setHighlights] = useState<HighlightResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHighlights = useCallback(async () => {
        if (!url) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await highlightsApi.getHighlights(url);
            setHighlights(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    const addHighlight = async (text: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const newHighlight = await highlightsApi.createHighlight({ url, text });
            setHighlights((prev) => [newHighlight, ...prev]);
            return newHighlight;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHighlight = async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);
            await highlightsApi.deleteHighlight(id);
            setHighlights((prev) => prev.filter((h) => h.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        highlights,
        isLoading,
        error,
        fetchHighlights,
        addHighlight,
        deleteHighlight,
    };
}
