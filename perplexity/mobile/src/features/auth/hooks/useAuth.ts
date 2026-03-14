import { useEffect } from 'react';
import { create } from 'zustand';
import { AuthService } from '../services/auth.service';
import { useChatStore } from '../../chat/store/chat.store';

interface AuthState {
    isLoading: boolean;
    isInitializing: boolean;
    isAuthenticated: boolean;
    error: string | null;
    user: any | null;
    
    checkAuth: () => Promise<void>;
    register: (email: string, password?: string, name?: string) => Promise<boolean>;
    login: (email: string, password?: string) => Promise<boolean>;
    googleLogin: () => Promise<boolean>;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isLoading: false,
    isInitializing: true,
    isAuthenticated: false,
    error: null,
    user: null,

    checkAuth: async () => {
        try {
            const token = await AuthService.getToken();
            if (token) {
                const user = await AuthService.getUser();
                set({ isAuthenticated: true, user });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (e) {
            console.error("Failed to fetch auth token during init");
            set({ isAuthenticated: false, user: null });
        } finally {
            set({ isInitializing: false });
        }
    },

    register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.register(email, password, name);
            const user = await AuthService.getUser();
            set({ isAuthenticated: true, user });
            return true;
        } catch (err: any) {
            console.log(err);
            set({ error: err.message || 'Registration failed' });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.login(email, password);
            const user = await AuthService.getUser();
            set({ isAuthenticated: true, user });
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Login failed' });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    googleLogin: async () => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.googleLogin();
            const user = await AuthService.getUser();
            set({ isAuthenticated: true, user });
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Google login failed' });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await AuthService.logout();
            set({ isAuthenticated: false, user: null });
            useChatStore.getState().clearStore();
        } catch (err: any) {
            console.error('Logout error:', err);
        } finally {
            set({ isLoading: false });
        }
    },
    getUser: async () => {
        try {
            const user = await AuthService.getUser();
            set({ user });
            return user;
        } catch (e) {
            console.error("Failed to fetch user info", e);
            set({ user: null });
        }
    },
}));

export const useAuth = () => {
    const store = useAuthStore();

    useEffect(() => {
        // Only run check if we are initializing
        if (store.isInitializing) {
            store.checkAuth();
        }
    }, []);

    return store;
};
