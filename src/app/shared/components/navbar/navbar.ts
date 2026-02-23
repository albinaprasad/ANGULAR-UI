import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { concat, filter, Subscription } from 'rxjs';
import { AuthService } from '../../../services/http/auth.service';
import { PopupService } from '../../../services/modal/popup.service';
import { SnackbarService } from '../../../services/modal/snackbar.service';
type NavItem = {
  label: string;
  route: string;
  icon?: string;
  title?: string;
  subtitle?: string;
};
type RoleType = 'admin' | 'student' | 'user';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnChanges, OnDestroy {

  @Input() title: string = 'My Application';
  @Input() logoUrl: string = '';
  @Input() navItems: NavItem[] = [];
  @Input() subtitle: string = '';
  @Input() roleType: RoleType = 'user';

  active: NavItem | null = null;
  private navSub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private popupService: PopupService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.setActiveByUrl(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.setActiveByUrl(event.urlAfterRedirects);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navItems'] && this.navItems.length) {
      this.setActiveByUrl(this.router.url);
    }
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  selectNavItem(item: NavItem): void {
    this.active = item;
    this.updateTitleFromItem(item);
  }

  logout(): void {
    this.popupService.show('Confirm Logout', 'Are you sure you want to logout?', () => {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
      console.log('User logged out');
      this.snackbarService.success('Logged out successfully', 3000);
    }, () => {
      // Cancel callback, do nothing
    });
  }

  private setActiveByUrl(url: string): void {
    const match = this.navItems.find(item => url.startsWith(item.route));
    if (match) {
      this.active = match;
      this.updateTitleFromItem(match);
    }
  }

  private updateTitleFromItem(item: NavItem): void {
    this.title = item.title ?? item.label ?? this.title;
    this.subtitle = item.subtitle ?? this.subtitle;
  }

  getRoleLabel(): string {
    if (this.roleType === 'admin') return 'Admin';
    if (this.roleType === 'student') return 'Student';
    return 'User';
  }

  getRoleIconPath(): string {
    if (this.roleType === 'admin') {
      return 'M12 2L4 5v6c0 5.08 3.41 9.81 8 11 4.59-1.19 8-5.92 8-11V5l-8-3zm0 3.15l5 1.88V11c0 3.73-2.4 7.3-5 8.47-2.6-1.17-5-4.74-5-8.47V7.03l5-1.88z';
    }
    if (this.roleType === 'student') {
      return 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 9.73L4.96 9 12 5.27 19.04 9 12 12.73zM6 12.95V17l6 3 6-3v-4.05l-6 3.27-6-3.27z';
    }
    return 'M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 9c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5zm-5.74 5c.83-1.17 3.02-2 5.74-2s4.91.83 5.74 2H6.26z';
  }

  getNavIconPath(item: NavItem): string {
    const key = `${item.label} ${item.route}`.toLowerCase();
    if (key.includes('dashboard')) {
      return 'M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z';
    }
    if (key.includes('profile') || key.includes('user')) {
      return 'M12 12c2.67 0 8 1.34 8 4v3H4v-3c0-2.66 5.33-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';
    }
    if (key.includes('notification')) {
      return 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2z';
    }
    if (key.includes('permission')) {
      return 'M12 1 3 5v6c0 5.25 3.84 10.18 9 11 5.16-.82 9-5.75 9-11V5l-9-4zm-1 15-4-4 1.41-1.41L11 13.17l4.59-4.58L17 10l-6 6z';
    }
    return 'M5 12h14v2H5zm0-5h14v2H5zm0 10h14v2H5z';
  }
}
