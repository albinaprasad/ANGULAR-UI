import { Component, EventEmitter, Output } from '@angular/core';
import { InsertRowService } from '../../../services/modal/insert-row.service';

@Component({
  selector: 'app-floating-action-bar',
  standalone: false,
  templateUrl: './floating-action-bar.html',
  styleUrl: './floating-action-bar.css',
})
export class FloatingActionBar {
  private isActive:boolean = false
  
  @Output() onClick = new EventEmitter<boolean>()

  constructor(private insertRowService: InsertRowService) {
    this.insertRowService.isActive$.subscribe(b => {
      this.isActive = b;
      console.log("Is open", this.isActive)
    })
  }

  handleClick() {
    this.isActive = !this.isActive;
    this.onClick.emit(this.isActive)
  }

}
