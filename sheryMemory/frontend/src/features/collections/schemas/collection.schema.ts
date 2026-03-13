import { z } from 'zod';

export const collectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type CollectionResponse = z.infer<typeof collectionSchema>;

export const createCollectionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
