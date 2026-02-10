import { Component, EventEmitter, Input, Output } from '@angular/core';

export type SelectOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-select-input',
  standalone: false,
  templateUrl: './select-input.html',
  styleUrls: ['./select-input.css']
})
export class SelectInput {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() options: SelectOption[] = [];
  @Input() disabled: boolean = false;

  @Input()
  get value(): string {
    return this.selectedValue;
  }
  set value(val: string | null | undefined) {
    this.selectedValue = val ?? '';
  }

  @Output() valueChange = new EventEmitter<string>();

  selectedValue: string = '';

  onValueChange(value: string): void {
    this.selectedValue = value;
    this.valueChange.emit(value);
  }
}
