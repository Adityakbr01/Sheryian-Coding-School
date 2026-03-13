import { useState, useCallback, useEffect } from 'react';
import { collectionsApi } from '../api/collections.api';
import { CollectionResponse, CreateCollectionInput } from '../schemas/collection.schema';

export function useCollections() {
    const [collections, setCollections] = useState<CollectionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCollections = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await collectionsApi.getCollections();
            setCollections(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const createCollection = useCallback(async (input: CreateCollectionInput) => {
        try {
            setIsLoading(true);
            setError(null);
            const newCollection = await collectionsApi.createCollection(input);
            setCollections((prev) => [...prev, newCollection]);
            return newCollection;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteCollection = useCallback(async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);
            await collectionsApi.deleteCollection(id);
            setCollections((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        collections,
        isLoading,
        error,
        fetchCollections,
        createCollection,
        deleteCollection,
    };
}
