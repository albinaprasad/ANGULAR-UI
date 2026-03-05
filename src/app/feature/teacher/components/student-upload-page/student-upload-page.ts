import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';

@Component({
  selector: 'app-student-upload-page',
  standalone: false,
  templateUrl: './student-upload-page.html',
  styleUrl: './student-upload-page.css',
})
export class StudentUploadPageComponent implements OnInit, OnDestroy {
  studentUserId = 0;
  studentName = '';
  studentEmail = '';

  selectedFile: File | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleDashboardService: RoleDashboardService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('studentId'));
      this.studentUserId = Number.isFinite(id) && id > 0 ? id : 0;
      if (!this.studentUserId) {
        this.errorMessage = 'Invalid student id.';
      }
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

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.selectedFile = null;
    this.errorMessage = '';
    this.successMessage = '';

    if (!file) return;

    const isPdfMime = file.type === 'application/pdf';
    const isPdfName = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfName) {
      this.errorMessage = 'Please select a valid PDF file.';
      return;
    }

    this.selectedFile = file;
  }

  submitUpload(): void {
    if (!this.selectedFile || this.loading || !this.studentUserId) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.roleDashboardService.uploadTeacherStudentPdf(this.studentUserId, this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'PDF uploaded successfully.';
        this.snackbarService.success(this.successMessage, 3500);
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
          this.errorMessage = error?.friendlyMessage || 'You are not authorized to upload for this student.';
          return;
        }

        this.errorMessage = error?.friendlyMessage || this.roleDashboardService.getErrorMessage(error as never);
      },
    });
  }
}
