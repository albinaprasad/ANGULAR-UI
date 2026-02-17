import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/http/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate{
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (this.authService.isSuperAdmin()) {
      return true;
    }

    return this.router.createUrlTree(['/user/profile']);
  }
}
