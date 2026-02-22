import { Component, HostBinding, Input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'button[app-button]',
  standalone: false,
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'secondary';

  @HostBinding('class.app-btn') baseClass = true;

  @HostBinding('class.app-btn--primary')
  get isPrimary(): boolean {
    return this.variant === 'primary';
  }

  @HostBinding('class.app-btn--secondary')
  get isSecondary(): boolean {
    return this.variant === 'secondary';
  }
}
