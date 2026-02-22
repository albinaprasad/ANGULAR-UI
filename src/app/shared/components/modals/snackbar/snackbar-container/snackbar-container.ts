import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Snackbar } from '../snackbar';
import { SnackbarData } from '../type';
import { SnackbarService } from '../../../../../services/modal/snackbar.service';


@Component({
  selector: 'app-snackbar-container',
  standalone: false,
  template: `
    <div class="snackbar-container">
      <app-snackbar
        *ngFor="let s of snackbars"
        [data]="s"
        (closed)="remove($event)"
      />
    </div>
  `,
  styles: [`
    .snackbar-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
  `]
})
export class SnackbarContainer implements OnDestroy {
  snackbars: SnackbarData[] = [];
  sub: Subscription;

  constructor(private snackbarService: SnackbarService) {
    this.sub = this.snackbarService.snackbar$.subscribe(s => {
      console.log("Snackbar container fired...")
      this.snackbars.push(s);
    });
  }

  remove(id: number) {
    this.snackbars = this.snackbars.filter(s => s.id !== id);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
