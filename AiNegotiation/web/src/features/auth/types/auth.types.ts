export interface User {
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin'
  score?: number
  totalSessions?: number
  wins?: number
  bestDealPrice?: number | null
  createdAt?: string
}

export interface LoginInput {
  email: string
  password?: string
}

export interface RegisterInput {
  email: string
  password?: string
  name?: string
}

export interface AuthResponse {
  success: boolean
  data: { user: User }
}
