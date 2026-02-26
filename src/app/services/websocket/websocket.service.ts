import { Injectable } from "@angular/core";
import { SnackbarService } from "../modal/snackbar.service";
import { BaseWebSocketService } from "./base.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { BaseWebSocketResponse } from "../../types/base-websocket.types";

export type WebSocketConnectionState = "connecting" | "open" | "closed" | "error";

@Injectable({
    providedIn: 'root'
})
export class WebSocketService extends BaseWebSocketService {

    private stateSubject = new BehaviorSubject<WebSocketConnectionState>("closed");
    private openSubject = new Subject<void>();
    private messageSubject = new Subject<BaseWebSocketResponse<string, unknown>>();
    private disconnectSubject = new Subject<CloseEvent>();
    private errorSubject = new Subject<Event>();

    private currentRoute: string | null = null;
    private currentToken: string | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempt = 0;
    private shouldReconnect = false;

    constructor(
        private snackBar: SnackbarService
    ) {
        super()
    }

    connect(route: string = "notifications"): void {
        const token = this.getAuthToken();
        this.currentRoute = route;
        this.shouldReconnect = true;

        if (!token) {
            this.stateSubject.next("closed");
            return;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentToken === token) return;
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING && this.currentToken === token) return;

        this.clearReconnectTimer();
        this.cleanupSocket();
        this.openSocket(route, token);
    }

    connectToUrl(route: string): void {
        this.connect(route);
    }

    private openSocket(route: string, token: string): void {
        this.stateSubject.next("connecting");
        const url = this.buildSocketUrl(route, token);
        this.socket = new WebSocket(url);
        this.currentToken = token;

        this.socket.onopen = () => {
            this.reconnectAttempt = 0;
            this.stateSubject.next("open");
            this.openSubject.next();
            this.snackBar.success("WebSocket connected");
        }

        this.socket.onmessage = (event) => {
            let parsed: BaseWebSocketResponse<string, unknown>;
            try {
                parsed = JSON.parse(event.data) as BaseWebSocketResponse<string, unknown>;
            } catch {
                parsed = { error: null, message: event.data };
            }

            this.messageSubject.next(parsed);

            const messageText = typeof parsed.message === "string"
                ? parsed.message
                : "New WebSocket message received";
            this.snackBar.success(messageText);
        }

        this.socket.onerror = (event) => {
            this.stateSubject.next("error");
            this.errorSubject.next(event);
            this.snackBar.error("WebSocket connection error");
        }

        this.socket.onclose = (event) => {
            this.stateSubject.next("closed");
            this.disconnectSubject.next(event);
            if (this.shouldReconnect) {
                this.snackBar.warning("WebSocket disconnected. Reconnecting...");
                this.scheduleReconnect();
            } else {
                this.snackBar.warning("WebSocket disconnected");
            }
            this.socket = undefined;
        }
    }

    send(data: unknown): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.snackBar.warning("WebSocket is not connected");
            return;
        }

        try {
            this.socket.send(JSON.stringify(data));
        } catch {
            this.snackBar.error("Failed to send WebSocket payload");
        }
    }

    onOpen$(): Observable<void> {
        return this.openSubject.asObservable();
    }

    onMessage$(): Observable<BaseWebSocketResponse<string, unknown>> {
        return this.messageSubject.asObservable();
    }

    onMessage(): Observable<BaseWebSocketResponse<string, unknown>> {
        return this.messageSubject.asObservable();
    }

    onDisconnect$(): Observable<CloseEvent> {
        return this.disconnectSubject.asObservable();
    }

    onStateChange(): Observable<WebSocketConnectionState> {
        return this.stateSubject.asObservable();
    }

    onError(): Observable<Event> {
        return this.errorSubject.asObservable();
    }

    disconnect(): void {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        this.currentToken = null;
        this.stateSubject.next("closed");
        this.cleanupSocket();
    }

    private scheduleReconnect(): void {
        if (!this.shouldReconnect || !this.currentRoute) return;
        if (!this.getAuthToken()) return;

        const delayMs = Math.min(30000, Math.pow(2, this.reconnectAttempt) * 1000);
        this.reconnectAttempt += 1;

        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            if (!this.shouldReconnect || !this.currentRoute) return;
            const token = this.getAuthToken();
            if (!token) return;
            this.openSocket(this.currentRoute, token);
        }, delayMs);
    }

    private clearReconnectTimer(): void {
        if (!this.reconnectTimer) return;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    }

    private cleanupSocket(): void {
        if (!this.socket) return;

        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;

        if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.close();
        }
        this.socket = undefined;
    }
}
