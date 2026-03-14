import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../../../services/api';

export const register = async (email: string, password?: string, name?: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data.data;
};

export const login = async (email: string, password?: string) => {
    const response = await api.post('/auth/login', { email, password });
    console.log(response.data);
    return response.data.data;
};

export const googleLogin = async () => {
    try {
        const redirectUrl = AuthSession.makeRedirectUri({
            scheme: 'perplexity', // needs to match app.json scheme if defined
            path: 'auth/callback'
        });

        // This opens the browser for authentication
        // Make sure backend uses this redirectUrl or configured correctly
        // Since backend uses passport-google-oauth20 callbackURL, we hit backend first.
        // Backend then redirects to Google.
        // Google redirects to Backend Callback.
        // Backend handles code exchange and redirects FINAL to the app with token.
        // We need to tell backend where to redirect finally?
        // Usually we pass ?redirect_uri=... to backend, and backend uses it.
        // But backend implementation redirects hardcoded in this example to exp://...

        const authUrl = `${api.defaults.baseURL}/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`;

        const result = await WebBrowser.openAuthSessionAsync(
            authUrl,
            redirectUrl
        );

        if (result.type === 'success' && result.url) {
            // Parse token from url
            // Url looks like: exp://.../auth/callback?token=...
            const params = new URLSearchParams(result.url.split('?')[1]);
            const token = params.get('token');
            return { token };
        }
        return { error: 'Login cancelled or failed' };
    } catch (error) {
        return { error };
    }
}
