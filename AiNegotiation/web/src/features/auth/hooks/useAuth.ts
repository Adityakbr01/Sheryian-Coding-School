import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginInput, RegisterInput } from '../types/auth.types'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response: any) => {
      const data = response.data || response
      if (data.user) {
        setCredentials(data.user)
        navigate('/')
      }
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response: any) => {
      const data = response.data || response
      if (data.user) {
        setCredentials(data.user)
        navigate('/')
      }
    },
  })

  const logout = async () => {
    await authApi.logout()
    clearCredentials()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    isUserLoading: isLoading,
    logout,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  }
}
