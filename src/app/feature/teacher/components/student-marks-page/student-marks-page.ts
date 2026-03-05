import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { StudentMark } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-marks-page',
  standalone: false,
  templateUrl: './student-marks-page.html',
  styleUrl: './student-marks-page.css',
})
export class StudentMarksPageComponent implements OnInit, OnDestroy {
  studentUserId = 0;
  studentName = '';
  studentEmail = '';

  marks: StudentMark[] = [];
  loading = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleDashboardService: RoleDashboardService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('studentId'));
      this.studentUserId = Number.isFinite(id) && id > 0 ? id : 0;
      if (!this.studentUserId) {
        this.errorMessage = 'Invalid student id.';
        return;
      }
      this.fetchMarks();
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.studentName = params.get('username') ?? '';
      this.studentEmail = params.get('email') ?? '';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/teacher/students']);
  }

  getPercentage(mark: StudentMark): number {
    if (!mark.total_mark || mark.total_mark <= 0) return 0;
    return (Number(mark.acquired_mark ?? 0) / Number(mark.total_mark ?? 0)) * 100;
  }

  private fetchMarks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleDashboardService.getTeacherStudentMarks(this.studentUserId).subscribe({
      next: (marks) => {
        this.marks = marks;
        this.loading = false;
      },
      error: (error: { status?: number; friendlyMessage?: string }) => {
        this.loading = false;

        if (error?.status === 401) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url },
          });
          return;
        }

        if (error?.status === 403) {
          this.errorMessage = error?.friendlyMessage || 'You are not authorized to view this student marks.';
          return;
        }

        this.errorMessage = error?.friendlyMessage || this.roleDashboardService.getErrorMessage(error as never);
      },
    });
  }
}
