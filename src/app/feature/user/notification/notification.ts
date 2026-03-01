import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/http/notification.service';
import { Notification } from '../../../types/notification.types';
import { Subject, of } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private refresh$ = new Subject<void>();
  private pendingSeenIds = new Set<number>();
  private expandedSeenByIds = new Set<number>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.bindNotificationReload();
    this.notificationService.connectNotificationsSocket();
    this.notificationService
      .onNotificationDbChanges(400)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh$.next());
    this.refresh$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoad(): void {
    this.refresh$.next();
  }

  onNotificationOpen(notification: Notification): void {
    const notificationId = notification.notification_id;
    if (notification.is_seen || this.pendingSeenIds.has(notificationId)) {
      return;
    }

    const previousState = {
      is_seen: notification.is_seen,
      seen_at: notification.seen_at,
      read_by_user_ids: [...notification.read_by_user_ids],
    };

    this.pendingSeenIds.add(notificationId);
    this.patchNotification(notificationId, {
      is_seen: true,
      seen_at: new Date().toISOString(),
    });

    this.notificationService
      .markAsSeen(notificationId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.pendingSeenIds.delete(notificationId))
      )
      .subscribe({
        next: (response) => {
          const updatedReaderIds = this.addReadById(notification.read_by_user_ids, response.user_id);
          this.patchNotification(notificationId, {
            is_seen: response.is_seen,
            seen_at: response.seen_at,
            read_by_user_ids: updatedReaderIds,
          });
        },
        error: () => {
          this.patchNotification(notificationId, previousState);
        },
      });
  }

  toggleSeenBy(notificationId: number): void {
    if (this.expandedSeenByIds.has(notificationId)) {
      this.expandedSeenByIds.delete(notificationId);
      return;
    }

    this.expandedSeenByIds.add(notificationId);
  }

  isSeenByExpanded(notificationId: number): boolean {
    return this.expandedSeenByIds.has(notificationId);
  }

  trackByNotificationId(_: number, notification: Notification): number {
    return notification.notification_id;
  }

  private bindNotificationReload(): void {
    this.refresh$
      .pipe(
        tap(() => {
          this.errorMessage = null;
          this.isLoading = true;
        }),
        switchMap(() =>
          this.notificationService.fetchNotifications().pipe(
            tap((response) => {
              this.notifications = this.sortNotifications(this.extractNotifications(response?.message));
            }),
            catchError(() => {
              this.errorMessage = 'Unable to load notifications. Please try again.';
              this.notifications = [];
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private sortNotifications(notifications: Notification[]): Notification[] {
    return [...notifications].sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return right - left;
    });
  }

  private extractNotifications(payload: unknown): Notification[] {
    if (!Array.isArray(payload)) return [];

    return payload.filter((item): item is Notification => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<Notification>;
      return (
        typeof candidate.notification_id === 'number' &&
        typeof candidate.message === 'string' &&
        typeof candidate.created_at === 'string' &&
        typeof candidate.is_seen === 'boolean' &&
        Array.isArray(candidate.read_by_user_ids)
      );
    });
  }

  private patchNotification(
    notificationId: number,
    patch: Partial<Pick<Notification, 'is_seen' | 'seen_at' | 'read_by_user_ids'>>
  ): void {
    this.notifications = this.notifications.map((item) =>
      item.notification_id === notificationId ? { ...item, ...patch } : item
    );
  }

  private addReadById(existingIds: number[], userId: number): number[] {
    if (existingIds.includes(userId)) return existingIds;
    return [...existingIds, userId];
  }
}
