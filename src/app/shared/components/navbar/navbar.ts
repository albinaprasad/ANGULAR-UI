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
}
