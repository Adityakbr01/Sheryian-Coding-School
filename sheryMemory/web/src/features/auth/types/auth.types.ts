export interface User {
  id: string
  email: string
  name?: string
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
  user: User
  token?: string
}
