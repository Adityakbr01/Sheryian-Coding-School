import { STORAGE_KEYS, saveItem, deleteItem, getItem } from '@/services/storage';
import * as AuthApi from '../api/auth.api';

export class AuthService {
    /**
     * Register a new user
     */
    static async register(email: string, password?: string, name?: string): Promise<void> {
        try {
            const response = await AuthApi.register(email, password, name);
            const tokenStr = response?.token || response?.data?.token;
            if (tokenStr) {
                await this.setToken(tokenStr);
                await this.setUser(response.user);
            } else {
                throw new Error('Registration failed: No token received');
            }
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Login an existing user
     */
    static async login(email: string, password?: string): Promise<void> {
        try {
            const response = await AuthApi.login(email, password);
            console.log('Login response:', response.data);
            const tokenStr = response?.data?.token;
            if (tokenStr) {
                await this.setToken(tokenStr);
                await this.setUser(response.data.user);
            } else {
                throw new Error('Login failed: No token received');
            }
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Login with Google OAuth
     */
    static async googleLogin(): Promise<void> {
        try {
            const result = await AuthApi.googleLogin();
            const tokenStr = (result && 'token' in result) ? result.token : (result as any)?.data?.token;

            if (tokenStr) {
                await this.setToken(tokenStr);
                await this.setUser((result as any)?.user);
            } else if ('error' in result) {
                throw new Error((result as any).error || 'Google login failed');
            } else {
                throw new Error('Google login failed: Unknown error');
            }
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout the user by removing the token
     */
    static async logout(): Promise<void> {
        await deleteItem(STORAGE_KEYS.AUTH_TOKEN);
        await deleteItem(STORAGE_KEYS.USER);
    }

    /**
     * Get the current user info
     */
    static async getUser(): Promise<any | null> {
        const userStr = await getItem(STORAGE_KEYS.USER);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return userStr;
        }
    }

    /**
     * Set the current user info
     */
    private static async setUser(user: any): Promise<void> {
        let userStr = typeof user === 'string' ? user : JSON.stringify(user);
        await saveItem(STORAGE_KEYS.USER, userStr);
    }

    /**
     * Get the current authentication token
     */
    static async getToken(): Promise<string | null> {
        return await getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Save the authentication token
     */
    private static async setToken(token: string): Promise<void> {
        await saveItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    

    /**
     * Format error safely
     */
    private static handleError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        if (error.message) {
            return new Error(error.message);
        }
        if (error instanceof Error) {
            return error;
        }
        return new Error('An unknown error occurred');
    }
}
