import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/http/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean | UrlTree {
    // BYPASS AUTHENTICATION FOR LOCAL DEMO
    // We check if it's set in localStorage to render UI properly, but don't strictly require a token
    if (localStorage.getItem('is_super_admin') === 'true') {
      return true;
    }

    /*
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (this.authService.isSuperAdmin()) {
      return true;
    }
    */
    return this.router.createUrlTree(['/auth/login']);
  }
}
