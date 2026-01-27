import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, LoginRequest } from '../types/auth.types';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken';
  private readonly API_URL = 'http://127.0.0.1:8000';

  constructor(private httpClient: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  login(username: string, password: string): Promise<AuthResponse> {
    const loginRequest: LoginRequest = { username, password };
    
    return firstValueFrom(
      this.httpClient.post<AuthResponse>(
        `${this.API_URL}/auth/login`, 
        loginRequest,
        { headers: this.getHeaders() }
      )
        .pipe(
          tap(response => {
            if (response.token) {
              this.setAuthToken(response.token);
            }
          })
        )
    );
  }

  register(email: string, password: string, name: string): Promise<AuthResponse> {
    const registerRequest = { email, password, name, password_confirmation: password };
    
    return firstValueFrom(
      this.httpClient.post<AuthResponse>(
        `${this.API_URL}/auth/register`, 
        registerRequest,
        { headers: this.getHeaders() }
      )
        .pipe(
          tap(response => {
            if (response.token) {
              this.setAuthToken(response.token);
            }
          })
        )
    );
  }
}
