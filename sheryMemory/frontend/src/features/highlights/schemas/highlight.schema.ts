import { z } from 'zod';

export const highlightSchema = z.object({
    id: z.string(),
    userId: z.string(),
    url: z.string().url(),
    text: z.string(),
    createdAt: z.string(),
});

export type HighlightResponse = z.infer<typeof highlightSchema>;

export const createHighlightSchema = z.object({
    url: z.string().url(),
    text: z.string().min(1),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;
