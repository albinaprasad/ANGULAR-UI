import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-text-input',
  standalone: false,
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css'],
})
export class TextInput implements OnChanges {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex = /^\+?[0-9()\-\s]{7,20}$/;

  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder!: string;
  @Input() required: boolean = false;
  @Input() validationType: 'none' | 'email' | 'phone' | 'custom' = 'none';
  @Input() validationPattern = '';
  @Input() customErrorMessage = '';
  @Input() showValidation = false;
  @Input()
  get value(): string {
    return this.inputValue;
  }
  set value(val: string | null | undefined) {
    this.inputValue = val ?? '';
  }
  @Output() valueChange = new EventEmitter<string>();
  @Output() validityChange = new EventEmitter<boolean>();

  inputValue: string = '';
  isValid = true;
  validationMessage = '';

  ngOnChanges(_changes: SimpleChanges): void {
    this.validate();
  }

  onInputChange(value: string): void {
    this.inputValue = value;
    this.validate();
    this.valueChange.emit(value);
    this.validityChange.emit(this.isValid);
  }

  private validate(): void {
    const value = this.inputValue.trim();

    if (!value) {
      this.isValid = !this.required;
      this.validationMessage = this.required ? `${this.label} is required.` : '';
      return;
    }

    if (this.validationType === 'email' && !this.emailRegex.test(value)) {
      this.isValid = false;
      this.validationMessage = this.customErrorMessage || 'Enter a valid email address.';
      return;
    }

    if (this.validationType === 'phone' && !this.phoneRegex.test(value) && value.length > 10) {
      this.isValid = false;
      this.validationMessage = this.customErrorMessage || 'Enter a valid phone number.';
      return;
    }

    if (this.validationType === 'custom' && this.validationPattern) {
      const customRegex = new RegExp(this.validationPattern);
      if (!customRegex.test(value)) {
        this.isValid = false;
        this.validationMessage = this.customErrorMessage || `Invalid ${this.label.toLowerCase()} format.`;
        return;
      }
    }

    this.isValid = true;
    this.validationMessage = '';
  }
}
