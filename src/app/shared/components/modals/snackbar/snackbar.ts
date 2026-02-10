import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarData, SnackbarType } from './type';

@Component({
  selector: 'app-snackbar',
  standalone:false,
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.css',
})
export class Snackbar implements OnInit{
  ngOnInit(): void {
    setTimeout(() => {
      this.close()
    }, this.data.duration)
  }

  @Input() data: SnackbarData = {
    id: 0,
    message: 'empty',
    duration: 0,
    type: SnackbarType.SUCCESS
  }
  @Output() closed = new EventEmitter<number>()

  close() {
  this.closed.emit(this.data.id);
  }
}
