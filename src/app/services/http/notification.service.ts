import { Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseHttpService } from "./base.service";
import {
  NotificationListResponse,
  NotificationSeenResponse,
  NotificationSocketEvent,
} from "../../types/notification.types";
import { WebSocketService } from "../websocket/websocket.service";
import { debounceTime, filter, map } from "rxjs/operators";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseHttpService {
  private unreadCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private httpClient: HttpClient,
    private websocketService: WebSocketService
  ) {
    super();
  }

  fetchNotifications(): Observable<NotificationListResponse> {
    return this.httpClient.get<NotificationListResponse>(
      `${this.API_URL}/notifications/user/`,
      { headers: this.getAuthHeaders() }
    );
  }

  markAsSeen(notificationId: number): Observable<NotificationSeenResponse> {
    return this.markAsSeenViaPath("seen", notificationId).pipe(
      catchError((error: unknown) => {
        const httpError = error as HttpErrorResponse;
        if (httpError?.status === 404 || httpError?.status === 405) {
          return this.markAsSeenViaPath("read", notificationId);
        }
        return throwError(() => error);
      })
    );
  }

  connectNotificationsSocket(): void {
    this.websocketService.connect("notifications");
  }

  unreadCount$(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(0, count));
  }

  deriveUnreadCount(notifications: Array<{ is_seen: boolean }>): number {
    return notifications.reduce(
      (acc, notification) => acc + (notification.is_seen === false ? 1 : 0),
      0
    );
  }

  onNotificationDbChanges(debounceMs: number = 400): Observable<NotificationSocketEvent> {
    return this.websocketService.onMessage$().pipe(
      map((socketPayload) => this.extractSocketEvent(socketPayload)),
      filter((event): event is NotificationSocketEvent => event !== null),
      filter((event) => event.event === "db_change"),
      filter((event) => event.model === "Notification" || event.model === "NotificationRead"),
      debounceTime(debounceMs)
    );
  }

  private extractSocketEvent(payload: unknown): NotificationSocketEvent | null {
    if (!payload || typeof payload !== "object") return null;

    const directEvent = this.asNotificationSocketEvent(payload);
    if (directEvent) return directEvent;

    if (!("message" in payload)) return null;
    return this.asNotificationSocketEvent(payload.message);
  }

  private asNotificationSocketEvent(value: unknown): NotificationSocketEvent | null {
    if (!value || typeof value !== "object") return null;

    if (!("event" in value) || !("action" in value) || !("model" in value) || !("object_id" in value)) {
      return null;
    }

    const candidate = value as Partial<NotificationSocketEvent>;

    const action = candidate.action;
    const hasValidAction =
      action === "created" ||
      action === "updated" ||
      action === "deleted";
    if (!hasValidAction) return null;
    if (typeof candidate.event !== "string") return null;
    if (typeof candidate.model !== "string") return null;
    if (typeof candidate.object_id !== "number") return null;
    if (candidate.actor_id !== null && typeof candidate.actor_id !== "number" && candidate.actor_id !== undefined) {
      return null;
    }

    return {
      event: candidate.event,
      action,
      model: candidate.model,
      object_id: candidate.object_id,
      actor_id: candidate.actor_id ?? null,
    };
  }

  private markAsSeenViaPath(
    alias: "seen" | "read",
    notificationId: number
  ): Observable<NotificationSeenResponse> {
    return this.httpClient.post<NotificationSeenResponse>(
      `${this.API_URL}/notifications/${alias}/${notificationId}/`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}
