import { z } from 'zod'

export const createHighlightSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  text: z.string().min(1, 'Highlight text is required'),
})

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>
