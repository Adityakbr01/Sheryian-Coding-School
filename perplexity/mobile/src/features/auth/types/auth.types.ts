export interface AuthResponse {
    token: string;
    message?: string;
}

export interface AuthError {
    message: string;
    status?: number;
}
