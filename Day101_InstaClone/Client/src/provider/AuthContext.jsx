import { createContext, useContext, useState, useCallback } from 'react'
import authApi from '../features/auth/services/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRegister = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.register(formData)
      setUser(res.data?.user ?? null)
      return res
    } catch (err) {
      setError(err.message ?? 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(formData)
      setUser(res.data?.user ?? null)
      return res
    } catch (err) {
      setError(err.message ?? 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, error, handleRegister, handleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}

export default AuthContext
