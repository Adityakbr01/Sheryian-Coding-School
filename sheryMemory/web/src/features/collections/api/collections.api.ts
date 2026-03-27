import Cookies from 'js-cookie'
import type { Collection } from '../types/collections.types'

const API_URL = 'http://localhost:5000/api' // Or relative path if behind proxy

const getHeaders = () => {
  const token = Cookies.get('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

export const collectionsApi = {
  list: async (): Promise<{ data: Collection[] }> => {
    const response = await fetch(`${API_URL}/collections`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch collections')
    return response.json()
  },
  get: async (id: string): Promise<{ data: Collection }> => {
    const response = await fetch(`${API_URL}/collections/${id}`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch collection')
    return response.json()
  },
  create: async (name: string): Promise<{ data: Collection }> => {
    const response = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error('Failed to create collection')
    return response.json()
  },
  update: async (id: string, name: string): Promise<{ data: Collection }> => {
    const response = await fetch(`${API_URL}/collections/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error('Failed to update collection')
    return response.json()
  },
  remove: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/collections/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete collection')
  },
}
