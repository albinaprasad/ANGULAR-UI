import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { GetTeacherStudentsParams, TeacherStudent, TeacherSubjectGroup } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-teacher-students-page',
  standalone: false,
  templateUrl: './students-page.html',
  styleUrl: './students-page.css'
})
export class TeacherStudentsPageComponent implements OnInit, OnDestroy {
  subjectGroups: TeacherSubjectGroup[] = [];
  loading = false;
  errorMessage = '';

  searchText = '';
  subjectCount = 0;
  studentCount = 0;

  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private destroyed = false;

  constructor(
    private roleDashboardService: RoleDashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.updateSearchQueryParam(query || null);
      });

    // Ensure first API call happens even if queryParamMap emission is delayed.
    this.applyQueryParams(this.route.snapshot.queryParamMap);

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((queryParamMap) => {
        this.applyQueryParams(queryParamMap);
      });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.search$.next(value.trim());
  }

  openMarksPage(student: TeacherStudent): void {
    const studentId = student.user_id || student.id;
    this.router.navigate(['/teacher/students', studentId, 'marks'], {
      queryParams: {
        username: student.username || '',
        email: student.email || '',
      },
    });
  }

  openUploadPage(student: TeacherStudent): void {
    const studentId = student.user_id || student.id;
    this.router.navigate(['/teacher/students', studentId, 'upload'], {
      queryParams: {
        username: student.username || '',
        email: student.email || '',
      },
    });
  }

  private fetchStudents(params: GetTeacherStudentsParams): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleDashboardService.getTeacherStudents(params).subscribe({
      next: (response) => {
        this.subjectGroups = response.subjects;
        this.subjectCount = response.subject_count;
        this.studentCount = response.student_count;
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
          this.errorMessage = error?.friendlyMessage || 'You are not authorized to view students.';
          this.requestViewUpdate();
          return;
        }

        this.errorMessage = error?.friendlyMessage || this.roleDashboardService.getErrorMessage(error as never);
        this.requestViewUpdate();
      },
    });
  }

  private updateSearchQueryParam(query: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query },
      replaceUrl: true,
    });
  }

  private applyQueryParams(queryParamMap: ParamMap): void {
    const q = (queryParamMap.get('q') ?? '').trim();

    this.searchText = q;

    this.fetchStudents({
      q: q || undefined,
    });
  }

  private requestViewUpdate(): void {
    if (this.destroyed) return;
    this.cdr.detectChanges();
  }
}
