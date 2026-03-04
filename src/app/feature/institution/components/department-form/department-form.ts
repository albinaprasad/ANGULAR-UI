import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-department-form',
  standalone: false,
  templateUrl: './department-form.html',
  styleUrl: './department-form.css'
})
export class DepartmentFormComponent {
  @Input() loading = false;
  @Output() submitDepartment = new EventEmitter<string>();

  name = '';
  hasSubmitted = false;

  submit(): void {
    this.hasSubmitted = true;
    const trimmedName = this.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return;
    }

    this.submitDepartment.emit(trimmedName);
    this.name = '';
    this.hasSubmitted = false;
  }

  get nameError(): string {
    if (!this.hasSubmitted) {
      return '';
    }

    const trimmedName = this.name.trim();
    if (!trimmedName) {
      return 'Department name is required.';
    }

    if (trimmedName.length < 2) {
      return 'Department name must be at least 2 characters.';
    }

    if (trimmedName.length > 80) {
      return 'Department name must be less than 80 characters.';
    }

    return '';
  }
}
