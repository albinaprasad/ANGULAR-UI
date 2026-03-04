import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, LoginRequest, User } from '../../types/auth.types';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import environmentJson from '../../../../configs/environment.json';
import { BaseHttpService } from './base.service';
import { BaseResponse } from '../../types/base-http.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {

  private readonly USER_ROLES_KEY = 'user_roles';
  public user = new BehaviorSubject<User | null>(null)
  public tokenChanges: BehaviorSubject<string | null>;
  

  constructor(private httpClient: HttpClient) {
    super();
    this.tokenChanges = new BehaviorSubject<string | null>(this.getAuthToken());
  }

  getUser(): User | null {
    return this.user.value
  }

  isSuperAdmin(): boolean {
    const currentUser = this.user.value;
    if (currentUser) {
      return Boolean(currentUser.is_superAdmin || currentUser.role?.includes('admin'));
    }

    return localStorage.getItem(environmentJson.IS_SUPER_ADMIN) === 'true'
      || this.getCurrentRoles().includes('admin');
  }

  getCurrentRoles(): string[] {
    const currentUserRoles = this.user.value?.role;
    if (Array.isArray(currentUserRoles) && currentUserRoles.length) {
      return currentUserRoles;
    }

    const storedRoles = this.getStoredRoles();
    if (storedRoles.length) {
      return storedRoles;
    }

    const token = this.getAuthToken();
    if (!token) return [];

    const payload = this.decodeJwtPayload(token);
    const payloadRoles = this.extractRoles(payload);
    if (payloadRoles.length) {
      localStorage.setItem(this.USER_ROLES_KEY, JSON.stringify(payloadRoles));
    }

    return payloadRoles;
  }

  getDefaultRoute(): string {
    if (this.isSuperAdmin()) {
      return '/admin/dashboard';
    }

    const roles = this.getCurrentRoles();
    if (roles.includes('institution')) {
      return '/institution/dashboard';
    }
    if (roles.includes('teacher')) {
      return '/teacher/dashboard';
    }
    if (roles.includes('student')) {
      return '/student/dashboard';
    }

    return '/user/profile';
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    this.tokenChanges.next(token);
  }

  getToken(): string | null {
    return this.getAuthToken();
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(environmentJson.IS_SUPER_ADMIN);
    localStorage.removeItem(this.USER_ROLES_KEY);
    this.tokenChanges.next(null);
    this.user.next(null);
  }

  login(username: string, password: string): Promise<BaseResponse<AuthResponse,string>> {
    const loginRequest: LoginRequest = { username, password };
    
    return firstValueFrom(
      this.httpClient.post<BaseResponse<AuthResponse,string>>(
        `${this.API_URL}/auth/login`, 
        loginRequest,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
          tap(response => {
            if (response.message?.token) {
              this.setAuthToken(response.message?.token ?? '');
              const roles = this.extractRoles(response.message?.user);
              localStorage.setItem(this.USER_ROLES_KEY, JSON.stringify(roles));
              if (response.message.user.is_superAdmin || roles.includes('admin'))
                localStorage.setItem(environmentJson.IS_SUPER_ADMIN, 'true' );
              else
                localStorage.setItem(environmentJson.IS_SUPER_ADMIN, 'false');
              this.user.next(response.message?.user ?? null)
            }
          })
        )
    );
  }

  register(email: string, password: string, username: string, role: string): Promise<BaseResponse<AuthResponse,string>> {
    const registerRequest = { email, password, username, password_confirmation: password, role };
    
    return firstValueFrom(
      this.httpClient.post<BaseResponse<AuthResponse,string>>(
        `${this.API_URL}/auth/register`, 
        registerRequest,
        { headers: this.getAuthHeaders() }
      )
        .pipe(
          tap(response => {
            console.log(response)
            if (response.message?.token) {
              this.setAuthToken(response.message?.token ?? '');
            }
          })
        )
    );
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload['exp'] !== 'number') return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return (payload['exp'] as number) <= nowInSeconds;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 2) return null;

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const jsonPayload = atob(normalized);

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private getStoredRoles(): string[] {
    try {
      const rawRoles = localStorage.getItem(this.USER_ROLES_KEY);
      if (!rawRoles) return [];

      const parsed = JSON.parse(rawRoles);
      return Array.isArray(parsed) ? parsed.filter((role) => typeof role === 'string') : [];
    } catch {
      return [];
    }
  }

  private extractRoles(payload: any): string[] {
    if (!payload) return [];

    const candidates: unknown[] = [];
    if (Array.isArray(payload?.role)) candidates.push(...payload.role);
    if (Array.isArray(payload?.roles)) candidates.push(...payload.roles);
    if (typeof payload?.role === 'string') candidates.push(payload.role);

    return candidates.filter((role): role is string => typeof role === 'string' && role.length > 0);
  }
}
