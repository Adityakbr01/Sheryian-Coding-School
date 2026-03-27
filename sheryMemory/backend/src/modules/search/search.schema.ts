import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
