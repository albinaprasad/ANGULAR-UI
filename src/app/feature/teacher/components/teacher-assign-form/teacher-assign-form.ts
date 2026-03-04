import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { DashboardUser } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-teacher-assign-form',
  standalone: false,
  templateUrl: './teacher-assign-form.html',
  styleUrl: './teacher-assign-form.css'
})
export class TeacherAssignFormComponent {
  searchText = '';
  searchLoading = false;
  assignLoading = false;
  errorMessage = '';
  users: DashboardUser[] = [];
  selectedStudent: DashboardUser | null = null;

  constructor(
    private roleDashboardService: RoleDashboardService,
    private snackbarService: SnackbarService
  ) {}

  searchStudents(): void {
    const query = this.searchText.trim();
    if (!query) {
      return;
    }

    this.searchLoading = true;
    this.errorMessage = '';

    this.roleDashboardService.searchInstitutionUsers('student', query).subscribe({
      next: (response) => {
        this.users = response.message ?? [];
        this.searchLoading = false;
      },
      error: (error: HttpErrorResponse & { friendlyMessage?: string }) => {
        this.errorMessage = error.friendlyMessage || this.roleDashboardService.getErrorMessage(error);
        this.searchLoading = false;
      },
    });
  }

  selectStudent(student: DashboardUser): void {
    this.selectedStudent = student;
  }

  assignStudent(): void {
    if (!this.selectedStudent) {
      this.snackbarService.warning('Select a student before assigning.', 3000);
      return;
    }

    this.assignLoading = true;

    this.roleDashboardService.assignStudentToTeacher(this.selectedStudent.id).subscribe({
      next: () => {
        this.snackbarService.success('Student assigned successfully.', 3000);
        this.assignLoading = false;
      },
      error: (error: HttpErrorResponse & { friendlyMessage?: string }) => {
        this.snackbarService.error(error.friendlyMessage || this.roleDashboardService.getErrorMessage(error), 4000);
        this.assignLoading = false;
      },
    });
  }
}
