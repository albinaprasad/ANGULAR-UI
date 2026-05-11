import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

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
  @Input() autocomplete = '';
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
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;

  inputValue: string = '';
  isValid = true;
  validationMessage = '';
  showPassword = false;
  currentInputType = 'text';
  private lastPointerToggleAt = 0;

  ngOnChanges(_changes: SimpleChanges): void {
    this.currentInputType = this.type;
    this.validate();
  }

  onInputChange(value: string): void {
    this.inputValue = value;
    this.validate();
    this.valueChange.emit(value);
    this.validityChange.emit(this.isValid);
  }

  onPasswordTogglePointerDown(event: MouseEvent | PointerEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.lastPointerToggleAt = Date.now();
    console.log('[TextInput] pointerdown on password toggle', {
      label: this.label,
      type: this.type,
      currentInputType: this.currentInputType,
      showPassword: this.showPassword,
    });
    this.togglePasswordVisibility();
  }

  onPasswordToggleClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('[TextInput] click on password toggle', {
      label: this.label,
      type: this.type,
      currentInputType: this.currentInputType,
      showPassword: this.showPassword,
      deltaMs: Date.now() - this.lastPointerToggleAt,
    });

    if (Date.now() - this.lastPointerToggleAt < 250) {
      return;
    }

    this.togglePasswordVisibility();
  }

  private togglePasswordVisibility(): void {
    if (this.type !== 'password') {
      console.log('[TextInput] toggle ignored because input type is not password', {
        label: this.label,
        type: this.type,
      });
      return;
    }

    this.showPassword = !this.showPassword;
    this.currentInputType = this.showPassword ? 'text' : 'password';

    const nativeInput = this.inputElement?.nativeElement;
    if (nativeInput) {
      nativeInput.type = this.currentInputType;
      nativeInput.focus();
      const length = nativeInput.value.length;
      nativeInput.setSelectionRange(length, length);
      console.log('[TextInput] password visibility toggled', {
        label: this.label,
        showPassword: this.showPassword,
        currentInputType: this.currentInputType,
        domInputType: nativeInput.type,
      });
      return;
    }

    console.log('[TextInput] password visibility toggled but no native input was found', {
      label: this.label,
      showPassword: this.showPassword,
      currentInputType: this.currentInputType,
    });
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
