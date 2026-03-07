import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { InstitutionService } from '../../../../services/http/institution.service';
import { ModalCloseService } from '../../../../services/modal/modal-close.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { Department } from '../../../../types/institution.types';

@Component({
  selector: 'app-create-teacher-modal',
  standalone: false,
  templateUrl: './create-teacher-modal.html',
  styleUrl: './create-teacher-modal.css'
})
export class CreateTeacherModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() departments: Department[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  username = '';
  email = '';
  password = '';
  departmentId: number | null = null;

  submitted = false;
  loading = false;
  departmentsLoading = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private institutionService: InstitutionService,
    private snackbarService: SnackbarService,
    private modalCloseService: ModalCloseService
  ) {}

  ngOnInit(): void {
    this.modalCloseService.closeAll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isOpen) return;
      this.forceClose();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.loadDepartments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    if (this.loading) return;
    this.resetForm();
    this.closed.emit();
  }

  submit(): void {
    this.submitted = true;
    if (this.usernameError || this.emailError || this.passwordError || this.departmentError) {
      return;
    }

    this.loading = true;
    this.institutionService.createTeacher({
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      department_id: this.departmentId as number,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.created.emit();
        this.snackbarService.success('Teacher created successfully.', 3000);
        this.resetForm();
      },
      error: (error: Error) => {
        this.loading = false;
        this.snackbarService.error(error.message, 4000);
      },
    });
  }

  onDepartmentChange(value: unknown): void {
    const parsed = Number(value);
    this.departmentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private loadDepartments(): void {
    if (this.departments.length > 0) {
      return;
    }

    this.departmentsLoading = true;
    this.institutionService.getDepartments().subscribe({
      next: (departments) => {
        this.departmentsLoading = false;
        this.departments = departments;
      },
      error: (error: Error) => {
        this.departmentsLoading = false;
        this.snackbarService.error(error.message, 4000);
      },
    });
  }

  get usernameError(): string {
    if (!this.submitted) return '';
    const value = this.username.trim();
    if (!value) return 'Username is required.';
    if (value.length < 3) return 'Username must be at least 3 characters.';
    return '';
  }

  get emailError(): string {
    if (!this.submitted) return '';
    const value = this.email.trim();
    if (!value) return 'Email is required.';
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) return 'Enter a valid email address.';
    return '';
  }

  get passwordError(): string {
    if (!this.submitted) return '';
    if (!this.password) return 'Password is required.';
    if (this.password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  get departmentError(): string {
    if (!this.submitted) return '';
    if (!this.departmentId) return 'Department is required.';
    return '';
  }

  private resetForm(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.departmentId = null;
    this.submitted = false;
  }

  private forceClose(): void {
    this.loading = false;
    this.resetForm();
    this.closed.emit();
  }
}
