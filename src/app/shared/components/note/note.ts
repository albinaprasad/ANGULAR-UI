import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-note',
  standalone: false,
  templateUrl: './note.html',
  styleUrl: './note.css',
})
export class Note {
  @Input() title = 'Note';
  @Input() message = '';
  @Input() variant: 'info' | 'success' | 'warning' | 'error' = 'info';
}
