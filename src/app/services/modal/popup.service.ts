import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PopupData } from '../../shared/components/modals/popup/type/popup.type';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private popupSubject = new Subject<PopupData>();
  popup$ = this.popupSubject.asObservable();
  onConfirm?: () => void;
  onCancel?: () => void;

  show(title: string, message: string,  onConfirm?: () => void, onCancel?: () => void) {
    this.popupSubject.next({ title, message });
    this.onConfirm = onConfirm ?? (() => {});
    this.onCancel = onCancel ?? (() => {});
  }
 
  close(confirmed: boolean = false) {
    this.popupSubject.next({ title: '', message: '' });
      if (this.onConfirm && confirmed) {
        this.onConfirm();
        this.onConfirm = undefined;
      }
      if (this.onCancel && !confirmed) {
        this.onCancel();
        this.onCancel = undefined;
      }
  }

}
