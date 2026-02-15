
export type AuthResponse = {
    token: string;
    user: any;
}

export type LoginRequest = {
    username: string;
    password: string;
}

export type User = {
    username : string;
    role: string;
    is_superAdmin: boolean
}