import { z } from 'zod'

export const SaveUrlMessage = z.object({
    type: z.literal('SAVE_URL'),
    url: z.string().url()
})

export const SaveHighlightMessage = z.object({
    type: z.literal('SAVE_HIGHLIGHT'),
    url: z.string().url(),
    text: z.string().min(1)
})

export const MessageSchema = z.discriminatedUnion('type', [
    SaveUrlMessage,
    SaveHighlightMessage
])

export type Message = z.infer<typeof MessageSchema>
