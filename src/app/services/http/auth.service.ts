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

    return localStorage.getItem(environmentJson.IS_SUPER_ADMIN) === 'true';
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    this.tokenChanges.next(token);
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
              if (response.message.user.is_superAdmin || response.message.user.role.includes('admin'))
                localStorage.setItem(environmentJson.IS_SUPER_ADMIN, 'true' );
              else
                localStorage.setItem(environmentJson.IS_SUPER_ADMIN, 'false');
              this.user.next(response.message?.user ?? null)
            }
          })
        )
    );
  }

  register(email: string, password: string, username: string): Promise<BaseResponse<AuthResponse,string>> {
    const registerRequest = { email, password, username, password_confirmation: password };
    
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
}
