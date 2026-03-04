import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Department, InstitutionTeacher, SubjectPayload } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-subject-form',
  standalone: false,
  templateUrl: './subject-form.html',
  styleUrl: './subject-form.css'
})
export class SubjectFormComponent {
  @Input() departments: Department[] = [];
  @Input() teachers: InstitutionTeacher[] = [];
  @Input() loading = false;

  @Output() submitSubject = new EventEmitter<SubjectPayload>();

  semesters: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  name = '';
  code = '';
  semester: number | null = null;
  departmentId: number | null = null;
  teacherId: number | null = null;

  hasSubmitted = false;

  submit(): void {
    this.hasSubmitted = true;
    if (this.validationError) {
      return;
    }

    this.submitSubject.emit({
      name: this.name.trim(),
      code: this.code.trim().toUpperCase(),
      semester: this.semester as number,
      department_id: this.departmentId as number,
      teacher_id: this.teacherId as number,
    });
  }

  onSemesterChange(value: string): void {
    const parsed = Number(value);
    this.semester = this.semesters.includes(parsed) ? parsed : null;
  }

  onDepartmentChange(value: string): void {
    const parsed = Number(value);
    this.departmentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  onTeacherChange(value: string): void {
    const parsed = Number(value);
    this.teacherId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  get validationError(): string {
    if (!this.hasSubmitted) {
      return '';
    }

    const trimmedName = this.name.trim();
    const trimmedCode = this.code.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return 'Subject name must be between 2 and 100 characters.';
    }

    if (!/^[A-Za-z0-9_-]{3,20}$/.test(trimmedCode)) {
      return 'Subject code must be 3-20 characters and use letters, numbers, _ or -.';
    }

    if (!this.semester) {
      return 'Select semester.';
    }

    if (!this.departmentId) {
      return 'Select department.';
    }

    if (!this.teacherId) {
      return 'Select teacher.';
    }

    return '';
  }

  getTeacherLabel(teacher: InstitutionTeacher): string {
    const person = teacher.user;
    if (!person) {
      return `Teacher #${teacher.teacher_id}`;
    }

    return `${person.name || person.username} (${person.email})`;
  }
}
