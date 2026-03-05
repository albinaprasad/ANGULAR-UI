import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../../../services/http/notification.service';
import { AuthService } from '../../../../services/http/auth.service';
import { Subject, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

type PanelNavItem = {
  label: string;
  route: string;
  title: string;
  subtitle: string;
  count?: number;
};

type PanelRoleType = 'admin' | 'institution' | 'teacher' | 'student' | 'user';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit, OnDestroy {
  showPanel = true;
  roleType: PanelRoleType = 'user';
  panelTitle = 'User Panel';
  panelSubtitle = 'Manage your profile and notifications';
  navItems: PanelNavItem[] = [];

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

  teacherPanel: PanelNavItem[] = [{
    'label': 'Dashboard', 'route': '/teacher/dashboard','title':'Teacher Panel', 'subtitle': 'Manage classes and student progress'
    }, {
    'label': 'Profile', 'route': '/user/profile','title':'Profile','subtitle': 'Edit and save your profile'
    }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle':'Your Notification', 'count': 0
    }
  ]

  studentPanel: PanelNavItem[] = [{
    'label': 'Dashboard', 'route': '/student/dashboard','title':'Student Panel', 'subtitle': 'View your marks and progress'
    }, {
    'label': 'Profile', 'route': '/user/profile','title':'Profile','subtitle': 'Edit and save your profile'
    }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle':'Your Notification', 'count': 0
    }
  ]

  institutionPanel: PanelNavItem[] = [{
    'label': 'Dashboard', 'route': '/institution/dashboard','title':'Institution Panel', 'subtitle': 'Manage institution activity and analytics'
    }, {
    'label': 'Members', 'route': '/institution/members','title':'Institution Members', 'subtitle': 'Browse teachers and students'
    }, {
    'label': 'Profile', 'route': '/user/profile','title':'Profile','subtitle': 'Edit and save your profile'
    }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle':'Your Notification', 'count': 0
    }
  ]

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    document.body.style.overflow = 'auto';
    this.updatePanelVisibility();
    this.initializePanelByRole();
    this.notificationService.connectNotificationsSocket();
    this.loadUnreadCount();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updatePanelVisibility());

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

    this.teacherPanel = this.teacherPanel.map((item) =>
      item.route === '/user/notification' ? { ...item, count } : item
    );

    this.institutionPanel = this.institutionPanel.map((item) =>
      item.route === '/user/notification' ? { ...item, count } : item
    );

    this.studentPanel = this.studentPanel.map((item) =>
      item.route === '/user/notification' ? { ...item, count } : item
    );

    this.initializePanelByRole();
  }

  private initializePanelByRole(): void {
    if (this.authService.isSuperAdmin()) {
      this.roleType = 'admin';
      this.navItems = this.adminPanel;
      this.panelTitle = 'Admin Panel';
      this.panelSubtitle = 'Manage your application settings and data';
      return;
    }

    const roles = this.authService.getCurrentRoles();
    if (roles.includes('institution')) {
      this.roleType = 'institution';
      this.navItems = this.institutionPanel;
      this.panelTitle = 'Institution Panel';
      this.panelSubtitle = 'Manage institution dashboard, profile and notifications';
      return;
    }

    if (roles.includes('teacher')) {
      this.roleType = 'teacher';
      this.navItems = this.teacherPanel;
      this.panelTitle = 'Teacher Panel';
      this.panelSubtitle = 'Manage teacher dashboard, profile and notifications';
      return;
    }

    if (roles.includes('student')) {
      this.roleType = 'student';
      this.navItems = this.studentPanel;
      this.panelTitle = 'Student Panel';
      this.panelSubtitle = 'View marks, profile and notifications';
      return;
    }

    this.roleType = 'user';
    this.navItems = this.userPanel;
    this.panelTitle = 'User Panel';
    this.panelSubtitle = 'Manage your profile and notifications';
  }

  private updatePanelVisibility(): void {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    this.showPanel = currentRoute.snapshot.data['hidePanel'] !== true;
  }
}
