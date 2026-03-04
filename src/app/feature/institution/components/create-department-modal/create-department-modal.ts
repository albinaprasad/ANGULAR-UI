import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstitutionService } from '../../../../services/http/institution.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { Department } from '../../../../types/institution.types';

@Component({
  selector: 'app-create-department-modal',
  standalone: false,
  templateUrl: './create-department-modal.html',
  styleUrl: './create-department-modal.css'
})
export class CreateDepartmentModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<Department>();

  name = '';
  loading = false;
  submitted = false;

  constructor(
    private institutionService: InstitutionService,
    private snackbarService: SnackbarService
  ) {}

  close(): void {
    if (this.loading) return;
    this.resetForm();
    this.closed.emit();
  }

  submit(): void {
    this.submitted = true;
    if (this.nameError) return;

    this.loading = true;
    this.institutionService.createDepartment({ name: this.name.trim() }).subscribe({
      next: (res) => {
        this.loading = false;
        const department: Department = { id: res.id, name: res.name };
        this.created.emit(department);
        this.snackbarService.success('Department created successfully.', 3000);
        this.close();
      },
      error: (error: Error) => {
        this.loading = false;
        this.snackbarService.error(error.message, 4000);
      },
    });
  }

  get nameError(): string {
    if (!this.submitted) return '';
    const value = this.name.trim();
    if (!value) return 'Department name is required.';
    if (value.length < 2) return 'Department name must be at least 2 characters.';
    return '';
  }

  private resetForm(): void {
    this.name = '';
    this.submitted = false;
    this.loading = false;
  }
}
