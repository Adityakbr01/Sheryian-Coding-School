import { ItemResponse, SaveItemInput, itemsListSchema, itemResponseSchema } from '../schemas/item.schema'
import { useAuthStore } from '../../../store/auth.store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function getHeaders() {
    const token = useAuthStore.getState().token
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

/**
 * Global response interceptor — if the backend returns 401,
 * the user's session is stale. Clear auth and force re-login.
 */
function handleUnauthorized(response: Response) {
    if (response.status === 401) {
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Session expired. Please log in again.')
    }
}

export const itemsApi = {
    async getItems(collectionId?: string | null): Promise<ItemResponse[]> {
        const url = collectionId
            ? `${API_URL}/items?collectionId=${collectionId}`
            : `${API_URL}/items`

        const response = await fetch(url, {
            headers: getHeaders()
        })

        if (!response.ok) {
            handleUnauthorized(response)
            throw new Error(`Failed to fetch items: ${response.statusText}`)
        }

        const data = await response.json()
        return itemsListSchema.parse(data.data)
    },

    async searchItems(query: string): Promise<ItemResponse[]> {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        })

        if (!response.ok) {
            handleUnauthorized(response)
            throw new Error('Failed to search items')
        }

        const data = await response.json()
        return itemsListSchema.parse(data.data)
    },

    async saveItem(input: SaveItemInput): Promise<ItemResponse> {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(input)
        })

        if (!response.ok) {
            handleUnauthorized(response)
            const err = await response.json().catch(() => ({}))
            throw new Error(err.message || err.error || `Failed to save item`)
        }

        const data = await response.json()
        return itemResponseSchema.parse(data.data)
    },

    async deleteItem(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        })

        if (!response.ok) {
            handleUnauthorized(response)
            throw new Error('Failed to delete item')
        }
    }
}
