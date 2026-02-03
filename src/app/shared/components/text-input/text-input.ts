import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-input',
  standalone: false,
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css'],
})
export class TextInput {
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder!: string;
  @Output() valueChange = new EventEmitter<string>();

  inputValue: string = '';

  onInputChange(value: string): void {
    this.inputValue = value;
    this.valueChange.emit(value);
  }
}
