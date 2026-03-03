import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/http/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    const currentRoles = this.authService.getCurrentRoles();
    const canAccess = expectedRoles.some((role) => currentRoles.includes(role));
    if (canAccess) {
      return true;
    }

    return this.router.parseUrl(this.authService.getDefaultRoute());
  }
}
