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
  @Input()
  get value(): string {
    return this.inputValue;
  }
  set value(val: string | null | undefined) {
    this.inputValue = val ?? '';
  }
  @Output() valueChange = new EventEmitter<string>();

  inputValue: string = '';

  onInputChange(value: string): void {
    this.inputValue = value;
    this.valueChange.emit(value);
  }
}
