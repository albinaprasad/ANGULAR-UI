import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { StudentMark } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class StudentDashboardComponent implements OnInit {
  marks: StudentMark[] = [];
  loading = true;
  errorMessage = '';

  constructor(private roleDashboardService: RoleDashboardService) {}

  ngOnInit(): void {
    this.fetchMarks();
  }

  fetchMarks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleDashboardService.getStudentMarks().subscribe({
      next: (response) => {
        this.marks = this.normalizeMarks(response.message ?? []);
        this.loading = false;
      },
      error: (error: HttpErrorResponse & { friendlyMessage?: string }) => {
        this.errorMessage = error.friendlyMessage || this.roleDashboardService.getErrorMessage(error);
        this.loading = false;
      },
    });
  }

  private normalizeMarks(marks: StudentMark[]): StudentMark[] {
    return marks.map((mark) => ({
      subject_name: (mark as StudentMark & { subject?: string }).subject_name || (mark as StudentMark & { subject?: string }).subject || '-',
      subject_code: (mark as StudentMark & { code?: string }).subject_code || (mark as StudentMark & { code?: string }).code || '-',
      acquired_mark: Number(mark.acquired_mark ?? 0),
      total_mark: Number(mark.total_mark ?? 0),
    }));
  }
}
