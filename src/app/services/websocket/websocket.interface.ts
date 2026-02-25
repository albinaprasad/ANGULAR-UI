export interface WebSocketInterface {
    onOpen(): void;
    onMessage(): any;
    onDisconnect(): void
}