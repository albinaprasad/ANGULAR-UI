export type AuthResponse = {
    token: string;
    message: string;
}

export type LoginRequest = {
    username: string;
    password: string;
}