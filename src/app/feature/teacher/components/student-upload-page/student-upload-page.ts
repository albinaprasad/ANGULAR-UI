import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import {
  TeacherAnswerKeyUploadResponse,
  TeacherOwnedSubject,
  TeacherPdfUploadResponse,
} from '../../../../types/role-dashboard.types';

type UploadType = 'general' | 'answerKey';

@Component({
  selector: 'app-student-upload-page',
  standalone: false,
  templateUrl: './student-upload-page.html',
  styleUrl: './student-upload-page.css',
})
export class StudentUploadPageComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  studentUserId = 0;
  studentName = '';
  studentEmail = '';
  uploadType: UploadType = 'general';
  selectedSubjectId: number | null = null;
  teacherSubjects: TeacherOwnedSubject[] = [];

  selectedFile: File | null = null;
  isDragOver = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  uploadStatusSteps = [
    'Preparing PDF',
    'Capturing texts',
    'Validating marks',
    'Prepared for download',
  ];
  currentStatusStep = -1;
  statusComplete = false;
  statusError = false;
  uploadedFileName = '';
  uploadedFileUrl = '';

  private readonly destroy$ = new Subject<void>();
  private statusTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleDashboardService: RoleDashboardService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadTeacherSubjects();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('studentId'));
      this.studentUserId = Number.isFinite(id) && id > 0 ? id : 0;
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.studentName = params.get('username') ?? '';
      this.studentEmail = params.get('email') ?? '';

      const uploadType = params.get('uploadType');
      if (uploadType === 'answerKey' || uploadType === 'general') {
        this.uploadType = uploadType;
      }

      const subjectId = Number(params.get('subjectId'));
      this.selectedSubjectId = Number.isFinite(subjectId) && subjectId > 0 ? subjectId : null;
    });
  }

  ngOnDestroy(): void {
    this.stopStatusProgress();
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/teacher/students']);
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.handleFileSelection(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.loading) return;
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (this.loading) return;

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.handleFileSelection(file);
  }

  submitUpload(): void {
    if (this.loading) return;

    if (this.uploadType === 'answerKey' && !this.selectedSubjectId) {
      this.errorMessage = 'Please select a subject for answer key upload.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please choose a PDF file before upload.';
      return;
    }

    if (!this.isPdfFile(this.selectedFile)) {
      this.errorMessage = 'Only PDF files are allowed.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.uploadedFileName = '';
    this.uploadedFileUrl = '';
    this.startStatusProgress();

    const upload$ = this.uploadType === 'answerKey'
      ? this.roleDashboardService.uploadTeacherSubjectAnswerKey(this.selectedSubjectId as number, this.selectedFile)
      : this.roleDashboardService.uploadTeacherPdf(this.selectedFile);

    upload$.subscribe({
      next: (response: TeacherPdfUploadResponse | TeacherAnswerKeyUploadResponse) => {
        this.loading = false;
        this.completeStatusProgress();
        this.successMessage = 'PDF uploaded successfully.';
        this.uploadedFileName = response.original_filename || response.stored_filename || '';
        this.uploadedFileUrl = response.file_url || '';
        this.resetUploadForm();
        this.snackbarService.success(this.successMessage, 3500);
      },
      error: (error: { status?: number; friendlyMessage?: string }) => {
        this.loading = false;
        this.failStatusProgress();

        if (error?.status === 401) {
          this.errorMessage = 'Login required';
          return;
        }

        if (error?.status === 403) {
          const ownSubjectMessage = (error?.friendlyMessage || '').toLowerCase();
          this.errorMessage = ownSubjectMessage.includes('own subject')
            ? 'You can upload only for your own subject'
            : 'Teacher role required';
          return;
        }

        if (error?.status === 400) {
          this.errorMessage = error?.friendlyMessage || 'Invalid or missing PDF.';
          return;
        }

        if (error?.status === 404) {
          this.errorMessage = 'Subject not found';
          return;
        }

        if (error?.status === 409) {
          this.errorMessage = 'Answer key already uploaded for this subject';
          return;
        }

        this.errorMessage = error?.friendlyMessage || 'Upload failed. Please try again.';
      },
    });
  }

  onUploadTypeChange(event: Event): void {
    const nextType = (event.target as HTMLSelectElement | null)?.value === 'answerKey' ? 'answerKey' : 'general';
    if (this.uploadType === nextType) return;

    this.uploadType = nextType;
    this.selectedSubjectId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubjectChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement | null)?.value ?? 0);
    this.selectedSubjectId = Number.isFinite(value) && value > 0 ? value : null;
    this.errorMessage = '';
  }

  private handleFileSelection(file: File | null): void {
    this.resetStatusProgress();
    this.selectedFile = null;
    this.errorMessage = '';
    this.successMessage = '';

    if (!file) return;

    if (!this.isPdfFile(file)) {
      this.errorMessage = 'Please select a valid PDF file.';
      return;
    }

    this.selectedFile = file;
  }

  private startStatusProgress(): void {
    this.stopStatusProgress();
    this.currentStatusStep = 0;
    this.statusComplete = false;
    this.statusError = false;

    this.statusTimer = setInterval(() => {
      if (this.currentStatusStep < 2) {
        this.currentStatusStep += 1;
        return;
      }

      this.stopStatusProgress();
    }, 1100);
  }

  private completeStatusProgress(): void {
    this.stopStatusProgress();
    this.currentStatusStep = this.uploadStatusSteps.length - 1;
    this.statusComplete = true;
    this.statusError = false;
  }

  private failStatusProgress(): void {
    this.stopStatusProgress();
    if (this.currentStatusStep < 0) {
      this.currentStatusStep = 0;
    }
    this.statusError = true;
    this.statusComplete = false;
  }

  private resetStatusProgress(): void {
    this.stopStatusProgress();
    this.currentStatusStep = -1;
    this.statusError = false;
    this.statusComplete = false;
  }

  private stopStatusProgress(): void {
    if (!this.statusTimer) return;
    clearInterval(this.statusTimer);
    this.statusTimer = null;
  }

  private loadTeacherSubjects(): void {
    this.roleDashboardService.getTeacherSubjects().pipe(takeUntil(this.destroy$)).subscribe({
      next: (subjects) => {
        this.teacherSubjects = subjects ?? [];
      },
      error: () => {
        this.teacherSubjects = [];
      },
    });
  }

  private resetUploadForm(): void {
    this.selectedFile = null;
    if (this.uploadType === 'answerKey') {
      this.selectedSubjectId = null;
    }

    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  private isPdfFile(file: File): boolean {
    const isPdfName = file.name.toLowerCase().endsWith('.pdf');
    return isPdfName;
  }
}
