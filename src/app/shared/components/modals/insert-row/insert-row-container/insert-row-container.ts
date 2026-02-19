import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InsertRowService } from '../../../../../services/modal/insert-row.service';
import { IInsertRow } from '../type/insert-row.type';

@Component({
  selector: 'app-insert-row-container',
  standalone: false,
  templateUrl: './insert-row-container.html',
  styleUrl: './insert-row-container.css',
})
export class InsertRowContainer implements OnDestroy{
  sub: Subscription;
  public insertRow: IInsertRow = {
    tableName: ''
  }

  constructor(private insertRowService: InsertRowService) {
    this.sub = this.insertRowService.insertRow$.subscribe(i => {
      this.insertRow = i
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }


}
