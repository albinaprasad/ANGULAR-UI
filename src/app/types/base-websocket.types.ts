export type BaseWebSocketResponse<T,H> = {
    error: T | null,
    message: H | null
}