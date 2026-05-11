import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { StudentMark, TeacherStudentAnswerSheetResponse } from '../../../../types/role-dashboard.types';
import { AuthService } from '../../../../services/http/auth.service';

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
  subjectId = 0;
  departmentId = 0;
  subjectName = '';
  subjectCode = '';

  marks: StudentMark[] = [];
  loading = false;
  errorMessage = '';
  answerSheetLoading = false;
  answerSheetError = '';
  answerSheet: TeacherStudentAnswerSheetResponse | null = null;
  answerSheetViewerUrl: SafeResourceUrl | null = null;
  editingSubjectId: number | null = null;
  draftMarkValue: number | null = null;
  savingSubjectId: number | null = null;
  saveMessage = '';

  private readonly destroy$ = new Subject<void>();
  private destroyed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleDashboardService: RoleDashboardService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
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
      this.fetchAnswerSheet();
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.studentName = params.get('username') ?? '';
      this.studentEmail = params.get('email') ?? '';
      this.subjectId = Number(params.get('subjectId') ?? 0) || 0;
      this.departmentId = Number(params.get('departmentId') ?? 0) || 0;
      this.subjectName = params.get('subjectName') ?? '';
      this.subjectCode = params.get('subjectCode') ?? '';
      if (this.studentUserId) {
        this.fetchAnswerSheet();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
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

  startEdit(mark: StudentMark): void {
    this.editingSubjectId = Number(mark.subject_id ?? 0);
    this.draftMarkValue = Number(mark.acquired_mark ?? 0);
    this.saveMessage = '';
  }

  cancelEdit(): void {
    this.editingSubjectId = null;
    this.draftMarkValue = null;
  }

  saveManualMark(mark: StudentMark): void {
    const teacherId = this.authService.getCurrentUserId();
    const subjectId = Number(mark.subject_id ?? 0);
    const acquiredMark = Number(this.draftMarkValue ?? NaN);

    if (!teacherId || !subjectId || !this.studentUserId || !Number.isFinite(acquiredMark)) {
      return;
    }

    this.savingSubjectId = subjectId;
    this.saveMessage = '';

    this.roleDashboardService.updateTeacherStudentMark({
      teacher_id: teacherId,
      student_id: this.studentUserId,
      subject_id: subjectId,
      department_id: this.departmentId || undefined,
      acquired_mark: acquiredMark,
    }).subscribe({
      next: () => {
        mark.acquired_mark = acquiredMark;
        this.savingSubjectId = null;
        this.editingSubjectId = null;
        this.draftMarkValue = null;
        this.saveMessage = 'Mark updated successfully.';
        this.requestViewUpdate();
      },
      error: (error: { friendlyMessage?: string }) => {
        this.savingSubjectId = null;
        this.saveMessage = error?.friendlyMessage || 'Unable to update mark.';
        this.requestViewUpdate();
      },
    });
  }

  private fetchMarks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleDashboardService.getTeacherStudentMarks(this.studentUserId).subscribe({
      next: (marks) => {
        this.marks = marks;
        this.loading = false;
        this.requestViewUpdate();
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
          this.requestViewUpdate();
          return;
        }

        this.errorMessage = error?.friendlyMessage || this.roleDashboardService.getErrorMessage(error as never);
        this.requestViewUpdate();
      },
    });
  }

  private fetchAnswerSheet(): void {
    const teacherId = this.authService.getCurrentUserId();
    if (!teacherId || !this.studentUserId || !this.departmentId) {
      this.answerSheetLoading = false;
      this.answerSheetError = 'Missing teacher, student, or department context for answer sheet.';
      this.requestViewUpdate();
      return;
    }

    this.answerSheetLoading = true;
    this.answerSheetError = '';

    this.roleDashboardService.fetchTeacherStudentAnswerSheet({
      teacher_id: teacherId,
      student_id: this.studentUserId,
      department_id: this.departmentId,
      subject_id: this.subjectId || undefined,
    }).subscribe({
      next: (response) => {
        this.answerSheet = response;
        this.answerSheetViewerUrl = response.file_url
          ? this.sanitizer.bypassSecurityTrustResourceUrl(response.file_url)
          : null;
        if (!response.file_url) {
          this.answerSheetError = 'Answer sheet response did not include a file URL.';
        }
        this.answerSheetLoading = false;
        this.requestViewUpdate();
      },
      error: (error: { friendlyMessage?: string }) => {
        this.answerSheet = null;
        this.answerSheetViewerUrl = null;
        this.answerSheetLoading = false;
        this.answerSheetError = error?.friendlyMessage || 'Unable to load answer sheet.';
        this.requestViewUpdate();
      },
    });
  }

  private requestViewUpdate(): void {
    if (this.destroyed) return;
    this.cdr.detectChanges();
  }
}
