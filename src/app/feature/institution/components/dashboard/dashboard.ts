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
  loadingDepartments = false;
  loadingSubjects = false;
  subjectsError = '';

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
  }

  onStudentCreated(): void {
    this.fetchDepartments();
  }

  onSubjectCreated(): void {
    this.showSubjectModal = false;
    this.fetchSubjects();
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

  fetchSubjects(): void {
    this.loadingSubjects = true;
    this.subjectsError = '';

    this.institutionService.getInstitutionSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
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

  private fetchTeachersDirectory(): void {
    this.institutionMembersService.getMembers({ role: 'teacher', pageSize: 500, page: 1, offset: 0 }).subscribe({
      next: (response) => {
        this.teacherDirectory = new Map(
          response.teachers.map((teacher) => [teacher.id, teacher] as const)
        );
        this.requestViewUpdate();
      },
      error: () => {
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
