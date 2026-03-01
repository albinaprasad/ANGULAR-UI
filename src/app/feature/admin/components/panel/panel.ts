import { Component, OnDestroy, OnInit } from '@angular/core';
import environmentJson from '../../../../../../configs/environment.json';
import { NotificationService } from '../../../../services/http/notification.service';
import { Subject, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

type PanelNavItem = {
  label: string;
  route: string;
  title: string;
  subtitle: string;
  count?: number;
};

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit, OnDestroy {
  isAdmin = localStorage.getItem(environmentJson.IS_SUPER_ADMIN) === 'true';
  adminPanel: PanelNavItem[] = [{
    'label': 'Dashboard', 'route': '/admin/dashboard','title':'Admin Panel', 'subtitle': 'Manage your data from here'
    }, {
    'label': 'Profile', 'route': '/user/profile','title':'Profile','subtitle': 'Edit and save your profile'
    }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle':'Your Notification', 'count': 0
    },{
    'label': 'Permission', 'route': '/admin/permissions', 'title': 'Permission', 'subtitle':'Grant and manage permissions'
    }];

  userPanel: PanelNavItem[] = [ {
    'label': 'Profile', 'route': '/user/profile','title':'Profile','subtitle': 'Edit and save your profile'
    }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle':'Your Notification', 'count': 0
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.connectNotificationsSocket();
    this.loadUnreadCount();

    this.notificationService
      .unreadCount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => this.applyNotificationCount(count));

    this.notificationService
      .onNotificationDbChanges(400)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUnreadCount());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUnreadCount(): void {
    this.notificationService
      .fetchNotifications()
      .pipe(
        map((response) => response.message ?? []),
        map((notifications) => this.notificationService.deriveUnreadCount(notifications)),
        catchError(() => of(0)),
        takeUntil(this.destroy$)
      )
      .subscribe((count) => this.notificationService.setUnreadCount(count));
  }

  private applyNotificationCount(count: number): void {
    this.adminPanel = this.adminPanel.map((item) =>
      item.route === '/user/notification' ? { ...item, count } : item
    );

    this.userPanel = this.userPanel.map((item) =>
      item.route === '/user/notification' ? { ...item, count } : item
    );
  }
}
