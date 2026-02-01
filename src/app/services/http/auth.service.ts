import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, LoginRequest } from '../../types/auth.types';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import environmentJson from '../../../../configs/environment.json';
import { BaseHttpService } from './base.service';
import { BaseResponse } from '../../types/base-http.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {

  constructor(private httpClient: HttpClient) {
    super();
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);'authToken'
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
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
            }
          })
        )
    );
  }

  register(email: string, password: string, name: string): Promise<BaseResponse<AuthResponse,string>> {
    const registerRequest = { email, password, name, password_confirmation: password };
    
    return firstValueFrom(
      this.httpClient.post<BaseResponse<AuthResponse,string>>(
        `${this.API_URL}/auth/register`, 
        registerRequest,
        { headers: this.getAuthHeaders() }
      )
        .pipe(
          tap(response => {
            if (response.message?.token) {
              this.setAuthToken(response.message?.token ?? '');
            }
          })
        )
    );
  }
}
