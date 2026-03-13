import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../api/auth.api'
import { LoginInput, RegisterInput } from '../schemas/auth.schema'
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const setAuth = useAuthStore((state) => state.setAuth)
    const logoutAction = useAuthStore((state) => state.logout)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const router = useRouter()

    const login = async (data: LoginInput) => {
        try {
            setIsLoading(true)
            setError(null)
            const res = await authApi.login(data)
            setAuth(res.user, res.token)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (data: RegisterInput) => {
        try {
            setIsLoading(true)
            setError(null)
            const res = await authApi.register(data)
            setAuth(res.user, res.token)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        logoutAction()
        router.push('/login')
    }

    return {
        login,
        register,
        logout,
        isLoading,
        error,
        isAuthenticated
    }
}
