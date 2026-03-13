import { z } from 'zod'

export const saveItemSchema = z.object({
    url: z.string().url('Must be a valid URL'),
    collectionId: z.string().cuid('Invalid collection ID format').optional(),
})

export const itemResponseSchema = z.object({
    id: z.string(),
    url: z.string().url(),
    title: z.string().nullable(),
    type: z.enum(['article', 'video', 'tweet', 'pdf', 'image']),
    status: z.enum(['pending', 'processed', 'failed']),
    collectionId: z.string().nullable().optional(),
    tags: z.array(z.object({
        tag: z.object({
            id: z.string(),
            name: z.string()
        })
    })).optional(),
    lastReviewedAt: z.string().nullable().optional(),
    reviewCount: z.number().default(0),
    createdAt: z.string(),
})

// Validation for fetching many items
export const itemsListSchema = z.array(itemResponseSchema)

export type SaveItemInput = z.infer<typeof saveItemSchema>
export type ItemResponse = z.infer<typeof itemResponseSchema>
