import { Injectable } from '@angular/core';
import {
  HttpContextToken,
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
import { InsertRowService } from '../services/modal/insert-row.service';
import { ModalCloseService } from '../services/modal/modal-close.service';
import { PopupService } from '../services/modal/popup.service';
import { SnackbarService } from '../services/modal/snackbar.service';

export const SKIP_GLOBAL_ERROR_SNACKBAR = new HttpContextToken<boolean>(() => false);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRedirecting = false;
  private lastErrorKey = '';
  private lastErrorAt = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private popupService: PopupService,
    private insertRowService: InsertRowService,
    private modalCloseService: ModalCloseService
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
        } else if (!req.context.get(SKIP_GLOBAL_ERROR_SNACKBAR)) {
          this.popupService.close(false);
          this.insertRowService.close();
          this.modalCloseService.closeAll();
          const message = this.extractErrorMessage(error);
          this.notifyErrorOnce(`${req.method}:${req.urlWithParams}:${error.status}:${message}`, message);
        }

        return throwError(() => error);
      })
    );
  }

  private notifyErrorOnce(key: string, message: string): void {
    const now = Date.now();
    if (this.lastErrorKey === key && now - this.lastErrorAt < 1500) return;
    this.lastErrorKey = key;
    this.lastErrorAt = now;
    this.snackbarService.error(message, 4000);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as unknown;
    if (typeof payload === 'string' && payload.trim()) return payload.trim();

    if (payload && typeof payload === 'object') {
      const body = payload as Record<string, unknown>;
      const candidates = [body['friendlyMessage'], body['error'], body['message'], body['detail']];
      for (const value of candidates) {
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }

    return 'Request failed. Please try again.';
  }
}
