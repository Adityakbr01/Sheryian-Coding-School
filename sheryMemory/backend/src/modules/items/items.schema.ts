import { z } from 'zod'

export const saveItemSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  collectionId: z.string().cuid('Invalid collection ID format').optional(),
})

export type SaveItemInput = z.infer<typeof saveItemSchema>
