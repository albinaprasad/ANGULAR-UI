import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupService } from '../../../../../services/modal/popup.service';
import { PopupData } from '../type/popup.type';

@Component({
  selector: 'app-popup-container',
  standalone: false,
  templateUrl: './popup-container.html',
  styleUrl: './popup-container.css',
})
export class PopupContainer implements OnDestroy {
  sub: Subscription;
  public popupData: PopupData = { title: '', message: '' };

  constructor(private popupService: PopupService, private cdr: ChangeDetectorRef) {
    this.sub = this.popupService.popup$.subscribe(p => {
      this.popupData = p;
      this.cdr.detectChanges();
    });
  }


  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  confirmCallback(_event: unknown) {
    this.popupService.close(true);
  }

  cancelCallback(_event: unknown) {
    this.popupService.close(false);
  }
}
