import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RoleDashboardService } from '../../../../services/http/role-dashboard.service';
import { GetTeacherStudentsParams, TeacherStudent, TeacherSubjectGroup } from '../../../../types/role-dashboard.types';
import { Action, ActionEmit, Column } from '../../../../types/table.types';

@Component({
  selector: 'app-teacher-students-page',
  standalone: false,
  templateUrl: './students-page.html',
  styleUrl: './students-page.css'
})
export class TeacherStudentsPageComponent implements OnInit, OnDestroy {
  subjectGroups: TeacherSubjectGroup[] = [];
  selectedSchemaSubjectId: number | null = null;
  loading = false;
  errorMessage = '';
  semesterFilter = 'all';
  expandedSubjectIds = new Set<number>();
  readonly studentColumns: Column[] = [
    { name: 'username', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'first_name', type: 'string' },
    { name: 'last_name', type: 'string' },
    { name: 'department_name', type: 'string' },
    { name: 'mark_completed', type: 'boolean' },
  ];
  readonly studentActions: Action<TeacherStudent, 'view' | 'upload'>[] = [
    {
      header: 'View',
      name: 'View',
      callback: () => 'view',
    },
    {
      header: 'Upload Marks',
      name: 'Upload Marks',
      callback: () => 'upload',
    },
  ];

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
  ) { }



  ngOnInit(): void {
    console.log("Testing...")
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

  onSemesterFilterChange(value: string): void {
    this.semesterFilter = value || 'all';
    this.ensureExpandedState();
  }

  clearSearch(): void {
    this.searchText = '';
    this.updateSearchQueryParam(null);
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

  openUploadPage(student: TeacherStudent, subjectId?: number): void {
    const studentId = student.id || student.user_id;
    this.router.navigate(['/teacher/students', studentId, 'upload'], {
      queryParams: {
        uploadType: 'general',
        subjectId: subjectId || null,
        username: student.username || '',
        email: student.email || '',
      },
    });
  }

  onStudentAction(event: ActionEmit<TeacherStudent, 'view' | 'upload'>, group?: TeacherSubjectGroup): void {
    const student = event.row as TeacherStudent;
    const actionType = event.action.callback(student);

    if (actionType === 'view') {
      this.openMarksPage(student);
      return;
    }

    this.openUploadPage(student, group?.subject_id);
  }

  openSubjectAnswerUpload(group: TeacherSubjectGroup): void {
    if (!group.subject_id) return;
    this.selectedSchemaSubjectId = this.selectedSchemaSubjectId === group.subject_id ? null : group.subject_id;
    this.requestViewUpdate();
  }

  closeSubjectAnswerUpload(): void {
    this.selectedSchemaSubjectId = null;
    this.requestViewUpdate();
  }

  isSubjectSchemaPanelOpen(group: TeacherSubjectGroup): boolean {
    return this.selectedSchemaSubjectId === group.subject_id;
  }

  toggleAllSubjectGroups(expand: boolean): void {
    if (!expand) {
      this.expandedSubjectIds.clear();
      return;
    }

    this.filteredSubjectGroups.forEach((group) => {
      this.expandedSubjectIds.add(group.subject_id);
    });
  }

  onGroupToggle(group: TeacherSubjectGroup, event: Event): void {
    const element = event.target as HTMLDetailsElement;
    if (element.open) {
      this.expandedSubjectIds.add(group.subject_id);
      return;
    }

    this.expandedSubjectIds.delete(group.subject_id);
  }

  isGroupExpanded(group: TeacherSubjectGroup): boolean {
    return this.expandedSubjectIds.has(group.subject_id);
  }

  get filteredSubjectGroups(): TeacherSubjectGroup[] {
    if (this.semesterFilter === 'all') return this.subjectGroups;
    const semester = Number(this.semesterFilter);
    return this.subjectGroups.filter((group) => group.semester === semester);
  }

  get availableSemesters(): number[] {
    const unique = new Set<number>();
    this.subjectGroups.forEach((group) => {
      if (typeof group.semester === 'number') unique.add(group.semester);
    });
    return Array.from(unique).sort((a, b) => a - b);
  }

  get isAllGroupsExpanded(): boolean {
    const groups = this.filteredSubjectGroups;
    return groups.length > 0 && groups.every((group) => this.expandedSubjectIds.has(group.subject_id));
  }

  private fetchStudents(params: GetTeacherStudentsParams): void {
    this.loading = true;
    this.errorMessage = '';

    this.roleDashboardService.getTeacherStudents(params).subscribe({
      next: (response) => {
        this.subjectGroups = response.subjects;
        this.subjectCount = response.subject_count;
        this.studentCount = response.student_count;
        this.ensureExpandedState();
        this.loading = false;
        this.requestViewUpdate();
        console.log(this.filteredSubjectGroups)
        this.filteredSubjectGroups.map((group) => {
          this.fetchAnswerSheetForSubject(group.subject_id)
        })
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

  private fetchAnswerSheetForSubject(params: number): void {
    console.log("Called for fetching answers...")
    this.roleDashboardService.searchAnswerKey(params)
      .subscribe({
        next: (reponse) => {
          console.log(reponse)
        }
      })
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

  private ensureExpandedState(): void {
    const validIds = new Set(this.subjectGroups.map((group) => group.subject_id));
    this.expandedSubjectIds.forEach((id) => {
      if (!validIds.has(id)) this.expandedSubjectIds.delete(id);
    });

    if (this.expandedSubjectIds.size === 0 && this.filteredSubjectGroups.length > 0) {
      this.expandedSubjectIds.add(this.filteredSubjectGroups[0].subject_id);
    }
  }

  private requestViewUpdate(): void {
    if (this.destroyed) return;
    this.cdr.detectChanges();
  }
}
