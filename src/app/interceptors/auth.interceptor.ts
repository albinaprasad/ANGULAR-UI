import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/http/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRedirecting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const requestWithAuth = token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(requestWithAuth).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRedirecting) {
          this.isRedirecting = true;
          this.authService.logout();

          const returnUrl = this.router.url;
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl },
            replaceUrl: true,
          }).finally(() => {
            this.isRedirecting = false;
          });
        }

        return throwError(() => error);
      })
    );
  }
}
