import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { StudentMark, StudentMarkOptionSubject, StudentMarkRow, StudentMarksFilterParams } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class StudentDashboardComponent implements OnInit {
  marks: StudentMark[] = [];
  semesters: number[] = [];
  subjects: StudentMarkOptionSubject[] = [];
  selectedSemester: number | null = null;
  selectedSubjectId: number | null = null;
  loadingOptions = true;
  loading = true;
  errorMessage = '';
  private destroyed = false;

  constructor(
    private roleDashboardService: RoleDashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchMarksOptions();
    this.fetchMarks();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  fetchMarks(): void {
    this.loading = true;
    this.errorMessage = '';

    const params: StudentMarksFilterParams = {};
    if (this.selectedSemester) params.semester = this.selectedSemester;
    if (this.selectedSubjectId) params.subject_id = this.selectedSubjectId;

    this.roleDashboardService.getStudentMarks(params).subscribe({
      next: (response) => {
        this.marks = this.normalizeMarks(response.message ?? []);
        this.loading = false;
        this.requestViewUpdate();
      },
      error: (error: HttpErrorResponse & { friendlyMessage?: string }) => {
        this.errorMessage = error.friendlyMessage || this.roleDashboardService.getErrorMessage(error);
        this.loading = false;
        this.requestViewUpdate();
      },
    });
  }

  onSemesterChange(value: string): void {
    const semester = Number(value);
    this.selectedSemester = Number.isFinite(semester) && semester > 0 ? semester : null;
    this.selectedSubjectId = null;
    this.fetchMarksOptions();
    this.fetchMarks();
  }

  onSubjectChange(value: string): void {
    const subjectId = Number(value);
    this.selectedSubjectId = Number.isFinite(subjectId) && subjectId > 0 ? subjectId : null;
    this.fetchMarks();
  }

  clearFilters(): void {
    this.selectedSemester = null;
    this.selectedSubjectId = null;
    this.fetchMarksOptions();
    this.fetchMarks();
  }

  get totalSubjects(): number {
    return this.marks.length;
  }

  get totalAcquiredMarks(): number {
    return this.marks.reduce((sum, mark) => sum + Number(mark.acquired_mark || 0), 0);
  }

  get totalPossibleMarks(): number {
    return this.marks.reduce((sum, mark) => sum + Number(mark.total_mark || 0), 0);
  }

  get averagePercentage(): number {
    if (this.totalPossibleMarks <= 0) return 0;
    return (this.totalAcquiredMarks / this.totalPossibleMarks) * 100;
  }

  private fetchMarksOptions(): void {
    this.loadingOptions = true;

    this.roleDashboardService.getStudentMarksOptions(this.selectedSemester || undefined).subscribe({
      next: (response) => {
        const payload = response.message;
        this.semesters = Array.isArray(payload?.semesters)
          ? payload.semesters.map((semester) => Number(semester)).filter((semester) => Number.isFinite(semester) && semester > 0)
          : [];
        this.subjects = Array.isArray(payload?.subjects) ? payload.subjects : [];
        if (this.selectedSubjectId && !this.subjects.some((subject) => subject.id === this.selectedSubjectId)) {
          this.selectedSubjectId = null;
        }
        this.loadingOptions = false;
        this.requestViewUpdate();
      },
      error: () => {
        this.semesters = [];
        this.subjects = [];
        this.loadingOptions = false;
        this.requestViewUpdate();
      },
    });
  }

  private normalizeMarks(marks: StudentMarkRow[]): StudentMark[] {
    return marks.map((mark) => ({
      subject_name: mark.subject__true_subject__name || (mark as unknown as StudentMark & { subject_name?: string }).subject_name || '-',
      subject_code: mark.subject__true_subject__code || (mark as unknown as StudentMark & { subject_code?: string }).subject_code || '-',
      acquired_mark: Number(mark.acquired_mark ?? 0),
      total_mark: Number(mark.total_mark ?? 0),
    }));
  }

  private requestViewUpdate(): void {
    if (this.destroyed) return;
    this.cdr.detectChanges();
  }
}
