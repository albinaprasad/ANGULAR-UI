export type BaseResponse<T,H> = {
    error: H | null;
    message: T | null;
} 