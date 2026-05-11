import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { InsertRowService } from '../../../../../services/modal/insert-row.service';
import { TableDescription } from '../../../../../types/admin.types';

@Component({
  selector: 'app-insert-row-container',
  standalone: false,
  templateUrl: './insert-row-container.html',
  styleUrl: './insert-row-container.css',
})
export class InsertRowContainer implements OnDestroy{
  sub: Subscription;
  public insertRow: TableDescription = {
    table: '',
    columns: []
  }

  constructor(private insertRowService: InsertRowService, private cdr: ChangeDetectorRef) {
    this.sub = this.insertRowService.insertRow$.subscribe(i => {
      this.insertRow = i
      this.cdr.detectChanges();
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  onBackDropClick(): void {
    this.insertRowService.close()
  }

}
