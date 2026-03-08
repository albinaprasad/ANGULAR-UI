import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalCloseService {
  private readonly closeAllSubject = new Subject<void>();
  readonly closeAll$ = this.closeAllSubject.asObservable();

  closeAll(): void {
    this.closeAllSubject.next();
  }
}
