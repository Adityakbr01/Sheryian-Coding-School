import { z } from 'zod'
import { LoginInput, RegisterInput, userResponseSchema, AuthResponse } from '../schemas/auth.schema'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const authApi = {
    async login(data: LoginInput): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || err.error || 'Failed to login')
        }

        const result = await response.json()
        // Parse through Zod before returning to ensure type safety
        return userResponseSchema.parse(result.data)
    },

    async register(data: RegisterInput): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || err.error || 'Failed to register')
        }

        const result = await response.json()
        return userResponseSchema.parse(result.data)
    }
}
