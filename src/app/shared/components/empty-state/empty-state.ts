import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  @Input() title = 'Nothing to show';
  @Input() message = 'There is currently no data available.';
  @Input() variant: 'empty' | 'error' = 'empty';
  @Input() compact = false;
}
