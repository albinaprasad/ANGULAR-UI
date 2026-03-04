import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InstitutionService } from '../../../../services/http/institution.service';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { InstitutionMember } from '../../../../types/institution-members.types';
import {
  Department,
  SetInstitutionSubjectResponse,
  TrueSubject,
} from '../../../../types/institution.types';

@Component({
  selector: 'app-create-subject-mapping-modal',
  standalone: false,
  templateUrl: './create-subject-mapping-modal.html',
  styleUrl: './create-subject-mapping-modal.css',
})
export class CreateSubjectMappingModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() departments: Department[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<SetInstitutionSubjectResponse>();

  trueSubjectId: number | null = null;
  semester: number | null = null;
  departmentId: number | null = null;
  teacherId: number | null = null;

  submitted = false;
  loading = false;
  teacherLoading = false;
  trueSubjectLoading = false;

  teachers: InstitutionMember[] = [];
  trueSubjectOptions: TrueSubject[] = [];
  trueSubjectSearch = '';

  private readonly trueSubjectSearch$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly trueSubjectCache = new Map<number, TrueSubject>();

  constructor(
    private institutionService: InstitutionService,
    private institutionMembersService: InstitutionMembersService,
    private snackbarService: SnackbarService
  ) {
    this.trueSubjectSearch$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.fetchTrueSubjects(query);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.initializeModalData();
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
    if (this.trueSubjectError || this.semesterError || this.departmentError || this.teacherError) {
      return;
    }

    this.loading = true;
    this.institutionService.setInstitutionSubject({
      true_subject_id: this.trueSubjectId as number,
      semester: this.semester as number,
      department_id: this.departmentId as number,
      teacher_id: this.teacherId as number,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.created.emit(response);
        this.snackbarService.success(`Subject mapped: ${response.name} (${response.code})`, 3000);
        this.close();
      },
      error: (error: Error) => {
        this.loading = false;
        this.snackbarService.error(error.message, 4500);
      },
    });
  }

  onTrueSubjectSearchChange(value: string): void {
    this.trueSubjectSearch = value;
    this.trueSubjectSearch$.next(value.trim());
  }

  onTrueSubjectChange(value: unknown): void {
    const parsed = Number(value);
    this.trueSubjectId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  onSemesterChange(value: unknown): void {
    const parsed = Number(value);
    this.semester = Number.isInteger(parsed) && parsed >= 1 && parsed <= 8 ? parsed : null;
  }

  onDepartmentChange(value: unknown): void {
    const parsed = Number(value);
    this.departmentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  onTeacherChange(value: unknown): void {
    const parsed = Number(value);
    this.teacherId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  get trueSubjectError(): string {
    if (!this.submitted) return '';
    if (!this.trueSubjectId) return 'True subject is required.';
    return '';
  }

  get semesterError(): string {
    if (!this.submitted) return '';
    if (!this.semester) return 'Semester is required.';
    if (!Number.isInteger(this.semester) || this.semester < 1 || this.semester > 8) {
      return 'Semester must be an integer between 1 and 8.';
    }
    return '';
  }

  get departmentError(): string {
    if (!this.submitted) return '';
    if (!this.departmentId) return 'Department is required.';
    return '';
  }

  get teacherError(): string {
    if (!this.submitted) return '';
    if (!this.teacherId) return 'Teacher is required.';
    return '';
  }

  getTrueSubjectLabel(subject: TrueSubject): string {
    return `${subject.name} (${subject.code})`;
  }

  getTeacherLabel(teacher: InstitutionMember): string {
    const fullName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
    if (fullName) {
      return `${fullName} (${teacher.email})`;
    }

    return `${teacher.username} (${teacher.email})`;
  }

  private initializeModalData(): void {
    this.fetchTeachers();
    this.fetchTrueSubjects('');
  }

  private fetchTeachers(): void {
    this.teacherLoading = true;
    this.institutionMembersService.getMembers({ role: 'teacher', pageSize: 200, page: 1, offset: 0 }).subscribe({
      next: (response) => {
        this.teachers = response.teachers;
        this.teacherLoading = false;
      },
      error: (error: Error) => {
        this.teacherLoading = false;
        this.snackbarService.error(error.message || 'Failed to load teachers.', 4000);
      },
    });
  }

  private fetchTrueSubjects(query: string): void {
    this.trueSubjectLoading = true;
    this.institutionService.getTrueSubjects({ q: query || undefined }).subscribe({
      next: (subjects) => {
        subjects.forEach((subject) => {
          this.trueSubjectCache.set(subject.id, subject);
        });

        this.trueSubjectOptions = query
          ? subjects
          : Array.from(this.trueSubjectCache.values());

        this.trueSubjectLoading = false;
      },
      error: (error: Error) => {
        this.trueSubjectLoading = false;
        this.snackbarService.error(error.message || 'Failed to load true subjects.', 4000);
      },
    });
  }

  private resetForm(): void {
    this.trueSubjectId = null;
    this.semester = null;
    this.departmentId = null;
    this.teacherId = null;
    this.trueSubjectSearch = '';
    this.submitted = false;
    this.loading = false;
  }
}
