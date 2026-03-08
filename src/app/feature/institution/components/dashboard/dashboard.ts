import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InstitutionService } from '../../../../services/http/institution.service';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { InstitutionMember } from '../../../../types/institution-members.types';
import { Department, InstitutionSubject } from '../../../../types/institution.types';

@Component({
  selector: 'app-institution-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class InstitutionDashboardComponent implements OnInit, OnDestroy {
  departments: Department[] = [];
  subjects: InstitutionSubject[] = [];
  teacherDirectory = new Map<number, InstitutionMember>();
  teacherOptions: InstitutionMember[] = [];
  loadingDepartments = false;
  loadingSubjects = false;
  subjectsError = '';
  subjectQuery = '';
  subjectPage = 1;
  readonly subjectPageSize = 20;
  subjectTotal = 0;
  subjectHasMore = false;

  editingDepartmentId: number | null = null;
  editingDepartmentName = '';
  departmentActionLoadingId: number | null = null;
  subjectActionLoadingId: number | null = null;
  subjectTeacherDraft: Record<number, number> = {};

  showDepartmentModal = false;
  showTeacherModal = false;
  showStudentModal = false;
  showSubjectModal = false;
  private destroyed = false;

  constructor(
    private institutionService: InstitutionService,
    private institutionMembersService: InstitutionMembersService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchDepartments();
    this.fetchTeachersDirectory();
    this.fetchSubjects();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  openDepartmentModal(): void {
    this.showDepartmentModal = true;
  }

  openTeacherModal(): void {
    this.showTeacherModal = true;
  }

  openStudentModal(): void {
    this.showStudentModal = true;
  }

  openSubjectModal(): void {
    this.showSubjectModal = true;
  }

  onDepartmentCreated(department: Department): void {
    const exists = this.departments.some((item) => item.id === department.id || item.name.toLowerCase() === department.name.toLowerCase());
    if (!exists) {
      this.departments = [...this.departments, department].sort((a, b) => a.name.localeCompare(b.name));
    }

    this.showDepartmentModal = false;
    this.fetchDepartments();
  }

  onTeacherCreated(): void {
    this.fetchDepartments();
    this.fetchTeachersDirectory();
  }

  onStudentCreated(): void {
    this.fetchDepartments();
  }

  onSubjectCreated(): void {
    this.showSubjectModal = false;
    this.fetchSubjects(1);
  }

  fetchDepartments(): void {
    this.loadingDepartments = true;
    this.institutionService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = [...departments].sort((a, b) => a.name.localeCompare(b.name));
        this.loadingDepartments = false;
        this.requestViewUpdate();
      },
      error: (error: Error) => {
        this.loadingDepartments = false;
        this.snackbarService.error(error.message, 4000);
        this.requestViewUpdate();
      },
    });
  }

  fetchSubjects(page = this.subjectPage): void {
    this.loadingSubjects = true;
    this.subjectsError = '';
    this.subjectPage = page;

    this.institutionService.getInstitutionSubjects({
      q: this.subjectQuery.trim() || undefined,
      page,
      pageSize: this.subjectPageSize,
    }).subscribe({
      next: (response) => {
        this.subjects = response.subjects;
        this.subjectTotal = response.total;
        this.subjectHasMore = response.hasMore;
        this.subjects.forEach((subject) => {
          this.subjectTeacherDraft[subject.id] = subject.teacher_id;
        });
        this.loadingSubjects = false;
        this.requestViewUpdate();
      },
      error: (error: Error) => {
        this.subjectsError = error.message;
        this.loadingSubjects = false;
        this.requestViewUpdate();
      },
    });
  }

  startRenameDepartment(department: Department): void {
    this.editingDepartmentId = department.id;
    this.editingDepartmentName = department.name;
  }

  cancelRenameDepartment(): void {
    if (this.departmentActionLoadingId) return;
    this.editingDepartmentId = null;
    this.editingDepartmentName = '';
  }

  saveDepartmentName(department: Department): void {
    if (this.departmentActionLoadingId || this.editingDepartmentId !== department.id) return;
    const nextName = this.editingDepartmentName.trim();
    if (!nextName) {
      this.snackbarService.error('Department name is required.', 3000);
      return;
    }
    if (nextName === department.name.trim()) {
      this.cancelRenameDepartment();
      return;
    }

    this.departmentActionLoadingId = department.id;
    this.institutionService.updateDepartment({
      department_id: department.id,
      name: nextName,
    }).subscribe({
      next: () => {
        this.snackbarService.success('Department updated successfully.', 3000);
        this.editingDepartmentId = null;
        this.editingDepartmentName = '';
        this.departmentActionLoadingId = null;
        this.fetchDepartments();
      },
      error: (error: Error) => {
        this.departmentActionLoadingId = null;
        this.snackbarService.error(error.message, 4500);
      },
    });
  }

  removeDepartment(department: Department): void {
    if (this.departmentActionLoadingId) return;
    const confirmed = window.confirm(`Remove department "${department.name}"?`);
    if (!confirmed) return;

    this.departmentActionLoadingId = department.id;
    this.institutionService.removeDepartment({ department_id: department.id }).subscribe({
      next: () => {
        this.departmentActionLoadingId = null;
        this.snackbarService.success('Department removed successfully.', 3000);
        this.fetchDepartments();
        this.fetchSubjects(1);
      },
      error: (error: Error) => {
        this.departmentActionLoadingId = null;
        this.snackbarService.error(error.message, 5000);
      },
    });
  }

  updateSubjectSearch(value: string): void {
    this.subjectQuery = value;
  }

  searchSubjects(): void {
    this.fetchSubjects(1);
  }

  goToPreviousSubjectPage(): void {
    if (this.subjectPage <= 1 || this.loadingSubjects) return;
    this.fetchSubjects(this.subjectPage - 1);
  }

  goToNextSubjectPage(): void {
    if (!this.subjectHasMore || this.loadingSubjects) return;
    this.fetchSubjects(this.subjectPage + 1);
  }

  onSubjectTeacherDraftChange(subjectId: number, value: unknown): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    this.subjectTeacherDraft[subjectId] = parsed;
  }

  reassignSubjectTeacher(subject: InstitutionSubject): void {
    if (this.subjectActionLoadingId) return;
    const teacherId = Number(this.subjectTeacherDraft[subject.id] ?? 0);
    if (!Number.isFinite(teacherId) || teacherId <= 0) {
      this.snackbarService.error('Please select a teacher.', 3000);
      return;
    }

    this.subjectActionLoadingId = subject.id;
    this.institutionService.reassignSubjectTeacher({
      subject_id: subject.id,
      teacher_id: teacherId,
    }).subscribe({
      next: () => {
        this.subjectActionLoadingId = null;
        this.snackbarService.success('Subject teacher updated.', 3000);
        this.fetchSubjects(this.subjectPage);
      },
      error: (error: Error) => {
        this.subjectActionLoadingId = null;
        this.snackbarService.error(error.message, 4500);
      },
    });
  }

  removeSubject(subject: InstitutionSubject): void {
    if (this.subjectActionLoadingId) return;
    const confirmed = window.confirm(`Remove subject "${subject.name || subject.code || subject.id}"?`);
    if (!confirmed) return;

    this.subjectActionLoadingId = subject.id;
    this.institutionService.removeInstitutionSubject({ subject_id: subject.id }).subscribe({
      next: () => {
        this.subjectActionLoadingId = null;
        this.snackbarService.success('Subject removed.', 3000);
        this.fetchSubjects(this.subjectPage);
      },
      error: (error: Error) => {
        this.subjectActionLoadingId = null;
        this.snackbarService.error(error.message, 5000);
      },
    });
  }

  getTeacherDisplay(subject: InstitutionSubject): string {
    if (subject.teacher_name && subject.teacher_name.trim()) {
      return subject.teacher_email
        ? `${subject.teacher_name} (${subject.teacher_email})`
        : subject.teacher_name;
    }

    const teacher = this.teacherDirectory.get(subject.teacher_id);
    if (!teacher) {
      return subject.teacher_id ? `Teacher #${subject.teacher_id}` : '-';
    }

    const fullName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
    const label = fullName || teacher.username || `Teacher #${subject.teacher_id}`;
    return teacher.email ? `${label} (${teacher.email})` : label;
  }

  getTeacherLabel(teacher: InstitutionMember): string {
    const fullName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
    const label = fullName || teacher.username || `Teacher #${teacher.teacher_id ?? teacher.id}`;
    return teacher.email ? `${label} (${teacher.email})` : label;
  }

  private fetchTeachersDirectory(): void {
    this.institutionMembersService.getMembers({ role: 'teacher', pageSize: 500, page: 1, offset: 0 }).subscribe({
      next: (response) => {
        this.teacherOptions = response.teachers;
        this.teacherDirectory = new Map();
        response.teachers.forEach((teacher) => {
          const mapKey = teacher.teacher_id ?? teacher.id;
          if (mapKey) {
            this.teacherDirectory.set(mapKey, teacher);
          }
        });
        this.requestViewUpdate();
      },
      error: () => {
        this.teacherOptions = [];
        this.teacherDirectory = new Map();
        this.requestViewUpdate();
      },
    });
  }

  private requestViewUpdate(): void {
    if (this.destroyed) {
      return;
    }
    this.cdr.detectChanges();
  }
}
