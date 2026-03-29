import { apiFetch } from '../../../lib/api'

export type UserRole = 'user' | 'admin'

interface ApiEnvelope<T> {
    success: boolean
    message?: string
    data: T
}

export interface AdminProduct {
    _id?: string
    id: string
    name: string
    description: string
    basePrice: number
    minimumPrice: number
    emoji: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface AdminUser {
    _id?: string
    id?: string
    name: string
    email: string
    role: UserRole
    score: number
    totalSessions: number
    wins: number
    createdAt?: string
}

export interface CreateProductInput {
    id: string
    name: string
    description: string
    basePrice: number
    minimumPrice: number
    emoji?: string
    isActive?: boolean
}

export interface UpdateProductInput {
    name?: string
    description?: string
    basePrice?: number
    minimumPrice?: number
    emoji?: string
    isActive?: boolean
}

export const adminApi = {
    listProducts: async (): Promise<ApiEnvelope<AdminProduct[]>> => {
        return apiFetch('/admin/products')
    },

    createProduct: async (payload: CreateProductInput): Promise<ApiEnvelope<AdminProduct>> => {
        return apiFetch('/admin/products', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateProduct: async (
        productId: string,
        payload: UpdateProductInput,
    ): Promise<ApiEnvelope<AdminProduct>> => {
        return apiFetch(`/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    deactivateProduct: async (productId: string): Promise<ApiEnvelope<AdminProduct>> => {
        return apiFetch(`/admin/products/${productId}`, {
            method: 'DELETE',
        })
    },

    listUsers: async (): Promise<ApiEnvelope<AdminUser[]>> => {
        return apiFetch('/admin/users')
    },

    updateUserRole: async (
        userId: string,
        role: UserRole,
    ): Promise<ApiEnvelope<Pick<AdminUser, 'name' | 'email' | 'role'>>> => {
        return apiFetch(`/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        })
    },
}
