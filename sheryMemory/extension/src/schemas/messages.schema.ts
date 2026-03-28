import { z } from 'zod'

export const SaveUrlMessage = z.object({
    type: z.literal('SAVE_URL'),
    url: z.string().url()
})

export const MessageSchema = z.discriminatedUnion('type', [
    SaveUrlMessage
])

export type Message = z.infer<typeof MessageSchema>
