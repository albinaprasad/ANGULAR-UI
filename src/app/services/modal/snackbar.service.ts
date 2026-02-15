import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SnackbarData, SnackbarType } from '../../shared/components/modals/snackbar/type';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private snackbarSubject = new Subject<SnackbarData>();
  snackbar$ = this.snackbarSubject.asObservable();

  private id = 0;

  show(message: string, type: SnackbarType, duration = 4000) {
    this.snackbarSubject.next({
      id: ++this.id,
      message,
      type,
      duration,
    });
  }

  success(message: string, duration?: number) {
    this.show(message, SnackbarType.SUCCESS, duration);
  }

  error(message: string, duration?: number) {
    this.show(message, SnackbarType.ERROR, duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, SnackbarType.WARNING, duration);
  }
}
