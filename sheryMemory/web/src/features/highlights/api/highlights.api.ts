import Cookies from 'js-cookie'
import type { HighlightsResponse } from '../types/highlights.types'

const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${Cookies.get('token') || ''}`,
})

export const highlightsApi = {
  getAll: async (
    color?: string,
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string
  ): Promise<HighlightsResponse> => {
    const url = new URL(`${API_URL}/highlights`)
    if (color) url.searchParams.append('color', color)
    if (page) url.searchParams.append('page', page.toString())
    if (limit) url.searchParams.append('limit', limit.toString())
    if (search) url.searchParams.append('search', search)
    if (sortBy) url.searchParams.append('sortBy', sortBy)

    const res = await fetch(url.toString(), { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch highlights')
    const json = await res.json()
    
    // Check for nested data structure from the API
    const data = json.data.data || json.data
    const totalPages = json.data.totalPages || 1
    const total = json.data.total || 0
    
    return { data, totalPages, total }
  },
  
  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/highlights/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete highlight')
  },
}
