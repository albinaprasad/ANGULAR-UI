import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardUser, Department } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-member-assign-form',
  standalone: false,
  templateUrl: './member-assign-form.html',
  styleUrl: './member-assign-form.css'
})
export class MemberAssignFormComponent {
  @Input() title = 'Assign User';
  @Input() actionLabel = 'Submit';
  @Input() selectedUser: DashboardUser | null = null;
  @Input() departments: Department[] = [];
  @Input() loading = false;

  @Output() submitAssignment = new EventEmitter<{ userId: number; departmentId: number }>();

  selectedDepartmentId: number | null = null;
  hasSubmitted = false;

  submit(): void {
    this.hasSubmitted = true;
    if (!this.selectedUser || !this.selectedDepartmentId) {
      return;
    }

    this.submitAssignment.emit({
      userId: this.selectedUser.id,
      departmentId: this.selectedDepartmentId,
    });
  }

  onDepartmentChange(value: string): void {
    const parsed = Number(value);
    this.selectedDepartmentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  get validationError(): string {
    if (!this.hasSubmitted) {
      return '';
    }

    if (!this.selectedUser) {
      return 'Select a user from the search table first.';
    }

    if (!this.selectedDepartmentId) {
      return 'Select a department.';
    }

    return '';
  }
}
