import { create } from 'zustand'
import type { User } from '../types/auth.types'
import { API_URL } from '@/lib/api'


interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setCredentials: (user: User) => void
  clearCredentials: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setCredentials: (user) => {
    set({ user, isAuthenticated: true, isLoading: false })
  },

  clearCredentials: () => {
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      })
      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
      const json = await res.json()
      set({ user: json.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
