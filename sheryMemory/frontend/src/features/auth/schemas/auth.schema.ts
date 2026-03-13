import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

export const userResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
        createdAt: z.string()
    }),
    token: z.string()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AuthResponse = z.infer<typeof userResponseSchema>
