import { z } from 'zod'

export const createCollectionSchema = z.object({
    name: z.string().min(1, 'Collection name is required').max(100)
})

export const updateCollectionSchema = z.object({
    name: z.string().min(1).max(100)
})

export const addItemToCollectionSchema = z.object({
    itemId: z.string().min(1, 'Item ID is required')
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
export type AddItemInput = z.infer<typeof addItemToCollectionSchema>
