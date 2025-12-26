import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-input',
  standalone: true,
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css'],
})
export class TextInput {
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder!: string;
}
