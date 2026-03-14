import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for token on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AuthService.getToken();
                if (token) {
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error("Failed to fetch auth token during init");
            } finally {
                setIsInitializing(false);
            }
        };
        checkAuth();
    }, []);

    const register = async (email: string, password?: string, name?: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await AuthService.register(email, password, name);
            setIsAuthenticated(true);
            return true;
        } catch (err: any) {
            console.log(err);
            setError(err.message || 'Registration failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password?: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await AuthService.login(email, password);
            setIsAuthenticated(true);
            return true;
        } catch (err: any) {
            setError(err.message || 'Login failed');
            return false;
        } finally {

            setIsLoading(false);
        }
    };

    const googleLogin = async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await AuthService.googleLogin();
            setIsAuthenticated(true);
            return true;
        } catch (err: any) {
            setError(err.message || 'Google login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setIsAuthenticated(false);
        } catch (err: any) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        isInitializing,
        isAuthenticated,
        error,
        register,
        login,
        googleLogin,
        logout,
    };
};
