import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/http/auth.service';
import { PopupService } from '../../../../services/modal/popup.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit, OnDestroy {
  isAdmin = false;
  isTeacher = false;
  studentName: string = '';
  private userSub?: Subscription;

  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {
    this.updateRoles();
  }

  ngOnInit(): void {
    // Push a dummy state so popstate fires when user presses the back button
    history.pushState({ panel: true }, '');

    // Subscribe to user changes so navbar updates reactively after login
    this.userSub = this.authService.user.subscribe(user => {
      this.updateRoles();
      if (user && user.username) {
        this.studentName = user.username;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  /** Intercept browser back button while logged in */
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    // Re-push state so the button is still interceptable if user cancels
    history.pushState({ panel: true }, '');
    this.popupService.show(
      'Leave & Logout?',
      'Going back will log you out of your account. Are you sure?',
      () => {
        this.authService.logout();
        this.snackbarService.success('Logged out successfully', 3000);
        this.router.navigate(['/auth/login']);
      },
      () => { /* Cancel – stay on the page */ }
    );
  }

  private updateRoles(): void {
    this.isAdmin = this.authService.isSuperAdmin();
    this.isTeacher = this.authService.isTeacher();
    const user = this.authService.getUser();
    if (user && user.username) {
      this.studentName = user.username;
    }
  }

  /** Detect if user is currently on an institution route */
  get isInstitutionRoute(): boolean {
    return this.router.url.startsWith('/institution');
  }

  adminPanel: any = [{
    'label': 'Dashboard', 'route': '/admin/dashboard', 'title': 'Admin Panel', 'subtitle': 'Manage your data from here'
  }, {
    'label': 'Institution', 'route': '/institution/manage', 'title': 'Institution', 'subtitle': 'Manage institutions & assignments'
  }, {
    'label': 'Permission', 'route': '/admin/permissions', 'title': 'Permission', 'subtitle': 'Grant and manage permissions'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle': 'Your Notification'
  }];

  institutionPanel: any = [{
    'label': 'Manage', 'route': '/institution/manage', 'title': 'INSTITUTION', 'subtitle': 'Manage institutions & teachers'
  }];

  teacherPanel: any = [{
    'label': 'Dashboard', 'route': '/teacher/dashboard', 'title': 'TEACHER', 'subtitle': 'Evaluate student uploads'
  }, {
    'label': 'Marks', 'route': '/teacher/marks', 'title': 'TEACHER', 'subtitle': 'View academic progress'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'TEACHER', 'subtitle': 'Edit and save your profile'
  }];

  userPanel: any = [{
    'label': 'Semesters', 'route': '/user/semesters', 'title': 'Student Panel', 'subtitle': 'View your semesters and marks'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }];
}

