import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import { InstitutionService } from '../../../../services/http/institution.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import {
  InstitutionMember,
  InstitutionMembersApiError,
  MemberRole,
} from '../../../../types/institution-members.types';
import { Department, InstitutionSearchUser } from '../../../../types/institution.types';

type MembersTabState = {
  items: InstitutionMember[];
  offset: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  error: string;
  total: number;
  loadedOnce: boolean;
};

@Component({
  selector: 'app-institution-members',
  standalone: false,
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class InstitutionMembersComponent implements OnInit, OnDestroy {
  @ViewChild('teacherScroll') teacherScroll?: ElementRef<HTMLElement>;
  @ViewChild('studentScroll') studentScroll?: ElementRef<HTMLElement>;

  activeTab: MemberRole = 'teacher';
  searchText = '';

  teacherState: MembersTabState = this.createDefaultState();
  studentState: MembersTabState = this.createDefaultState();

  departments: Department[] = [];
  loadingDepartments = false;

  existingQuery = '';
  existingUsers: InstitutionSearchUser[] = [];
  existingUsersLoading = false;
  existingUsersError = '';
  selectedExistingUserId: number | null = null;
  selectedExistingDepartmentId: number | null = null;
  addingExisting = false;

  showCreateTeacherModal = false;
  showCreateStudentModal = false;

  rowActionLoadingKey = '';
  memberDepartmentDraft: Record<string, number> = {};

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly scrollPositions: Record<MemberRole, number> = { teacher: 0, student: 0 };
  private destroyed = false;

  constructor(
    private institutionMembersService: InstitutionMembersService,
    private institutionService: InstitutionService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetTabState('teacher');
        this.resetTabState('student');
        this.loadFirstPage('teacher');
        this.loadFirstPage('student');
      });

    this.loadDepartments();
    this.loadFirstPage('teacher');
    this.loadFirstPage('student');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: MemberRole): void {
    if (this.activeTab === tab) {
      return;
    }

    this.captureCurrentScroll();
    this.activeTab = tab;
    this.resetMutationForms();

    setTimeout(() => {
      this.restoreScroll(tab);
      this.requestViewUpdate();
    }, 0);
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.searchSubject.next(value.trim());
  }

  retryActiveTab(): void {
    this.loadNextPage(this.activeTab);
  }

  onReachedBottom(role: MemberRole): void {
    this.loadNextPage(role);
  }

  onScroll(role: MemberRole): void {
    const el = this.getScrollContainer(role);
    if (el) {
      this.scrollPositions[role] = el.scrollTop;
    }
  }

  trackByMemberId(index: number, item: InstitutionMember): number {
    return item.id || index;
  }

  getState(role: MemberRole): MembersTabState {
    return role === 'teacher' ? this.teacherState : this.studentState;
  }

  get selectedExistingUser(): InstitutionSearchUser | null {
    return this.existingUsers.find((user) => user.id === this.selectedExistingUserId) ?? null;
  }

  searchExistingUsers(): void {
    const query = this.existingQuery.trim();
    if (!query || this.existingUsersLoading) {
      return;
    }

    this.existingUsersLoading = true;
    this.existingUsersError = '';
    this.existingUsers = [];
    this.selectedExistingUserId = null;

    this.institutionService.searchUsers(this.activeTab, query).subscribe({
      next: (users) => {
        this.existingUsersLoading = false;
        this.existingUsers = users;
      },
      error: (error: Error) => {
        this.existingUsersLoading = false;
        this.existingUsersError = error.message || 'Failed to search users.';
      },
    });
  }

  selectExistingUser(userId: number): void {
    this.selectedExistingUserId = userId;
  }

  onExistingDepartmentChange(value: unknown): void {
    const parsed = Number(value);
    this.selectedExistingDepartmentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  addExistingMember(): void {
    if (this.addingExisting) return;
    if (!this.selectedExistingUserId || !this.selectedExistingDepartmentId) {
      this.snackbarService.error('Select user and department before adding.', 3500);
      return;
    }

    this.addingExisting = true;
    const request$ = this.activeTab === 'teacher'
      ? this.institutionService.addExistingTeacher({
        teacher_user_id: this.selectedExistingUserId,
        department_id: this.selectedExistingDepartmentId,
      })
      : this.institutionService.addExistingStudent({
        student_user_id: this.selectedExistingUserId,
        department_id: this.selectedExistingDepartmentId,
      });

    request$.subscribe({
      next: () => {
        this.addingExisting = false;
        this.snackbarService.success(`${this.capitalizeRole(this.activeTab)} added successfully.`, 3000);
        this.resetMutationForms();
        this.reloadRole(this.activeTab);
      },
      error: (error: Error) => {
        this.addingExisting = false;
        this.snackbarService.error(error.message, 4500);
      },
    });
  }

  openCreateModal(): void {
    if (this.activeTab === 'teacher') {
      this.showCreateTeacherModal = true;
      return;
    }

    this.showCreateStudentModal = true;
  }

  onTeacherCreated(): void {
    this.showCreateTeacherModal = false;
    this.reloadRole('teacher');
  }

  onStudentCreated(): void {
    this.showCreateStudentModal = false;
    this.reloadRole('student');
  }

  getDepartmentDraft(member: InstitutionMember, role: MemberRole): number | null {
    const key = this.getRowActionKey(member, role);
    const value = this.memberDepartmentDraft[key];
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  onMemberDepartmentDraftChange(member: InstitutionMember, role: MemberRole, value: unknown): void {
    const parsed = Number(value);
    const key = this.getRowActionKey(member, role);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    this.memberDepartmentDraft[key] = parsed;
  }

  updateMemberDepartment(member: InstitutionMember, role: MemberRole): void {
    const key = this.getRowActionKey(member, role);
    if (this.rowActionLoadingKey) return;

    const nextDepartmentId = Number(this.memberDepartmentDraft[key] ?? 0);
    if (!Number.isFinite(nextDepartmentId) || nextDepartmentId <= 0) {
      this.snackbarService.error('Please select a department.', 3500);
      return;
    }

    const memberId = this.resolveMemberEntityId(member, role);
    if (!memberId) {
      this.snackbarService.error(`Missing ${role} id for this row.`, 4000);
      return;
    }

    this.rowActionLoadingKey = key;
    const request = role === 'teacher'
      ? this.institutionService.updateTeacherDepartment({ teacher_id: memberId, department_id: nextDepartmentId })
      : this.institutionService.updateStudentDepartment({ student_id: memberId, department_id: nextDepartmentId });

    request.subscribe({
      next: () => {
        this.rowActionLoadingKey = '';
        this.snackbarService.success('Department updated.', 3000);
        this.reloadRole(role);
      },
      error: (error: Error) => {
        this.rowActionLoadingKey = '';
        this.snackbarService.error(error.message, 5000);
      },
    });
  }

  removeMember(member: InstitutionMember, role: MemberRole): void {
    const key = this.getRowActionKey(member, role);
    if (this.rowActionLoadingKey) return;

    const label = member.username || member.email || `${role} #${member.id}`;
    const confirmed = window.confirm(`Remove ${role} "${label}" from institution?`);
    if (!confirmed) return;

    const memberId = this.resolveMemberEntityId(member, role);
    if (!memberId) {
      this.snackbarService.error(`Missing ${role} id for this row.`, 4000);
      return;
    }

    this.rowActionLoadingKey = key;
    const request = role === 'teacher'
      ? this.institutionService.removeTeacher({ teacher_id: memberId })
      : this.institutionService.removeStudent({ student_id: memberId });

    request.subscribe({
      next: () => {
        this.rowActionLoadingKey = '';
        this.snackbarService.success(`${this.capitalizeRole(role)} removed.`, 3000);
        this.reloadRole(role);
      },
      error: (error: Error) => {
        this.rowActionLoadingKey = '';
        this.snackbarService.error(error.message, 5000);
      },
    });
  }

  private loadFirstPage(role: MemberRole): void {
    const state = this.getState(role);
    if (state.loading) return;

    state.offset = 0;
    state.page = 1;
    state.hasMore = true;
    state.items = [];
    state.error = '';
    this.loadNextPage(role);
  }

  private loadNextPage(role: MemberRole): void {
    const state = this.getState(role);
    if (state.loading || !state.hasMore) {
      return;
    }

    state.loading = true;
    state.error = '';

    this.institutionMembersService
      .getMembers({
        role,
        q: this.searchText.trim() || undefined,
        pageSize: state.pageSize,
        page: state.page,
        offset: state.offset,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const incoming = role === 'teacher' ? response.teachers : response.students;
          const deduped = this.dedupeMembers([...state.items, ...incoming]);
          state.items = deduped;

          if (role === 'teacher') {
            state.total = response.teacherTotal;
            state.hasMore = response.teacherHasMore;
          } else {
            state.total = response.studentTotal;
            state.hasMore = response.studentHasMore;
          }

          state.items.forEach((member) => {
            const key = this.getRowActionKey(member, role);
            if (!this.memberDepartmentDraft[key] && member.department_id) {
              this.memberDepartmentDraft[key] = member.department_id;
            }
          });

          state.offset += state.pageSize;
          state.page += 1;
          state.loadedOnce = true;
          state.loading = false;
          this.requestViewUpdate();
        },
        error: (error: InstitutionMembersApiError | Error) => {
          state.error = error.message || 'Failed to load members.';
          state.loading = false;
          state.loadedOnce = true;
          this.requestViewUpdate();
        },
      });
  }

  private loadDepartments(): void {
    if (this.loadingDepartments) return;
    this.loadingDepartments = true;
    this.institutionService.getDepartments().subscribe({
      next: (departments) => {
        this.loadingDepartments = false;
        this.departments = departments;
      },
      error: (error: Error) => {
        this.loadingDepartments = false;
        this.snackbarService.error(error.message || 'Failed to load departments.', 4500);
      },
    });
  }

  private createDefaultState(): MembersTabState {
    return {
      items: [],
      offset: 0,
      page: 1,
      pageSize: 20,
      hasMore: true,
      loading: false,
      error: '',
      total: 0,
      loadedOnce: false,
    };
  }

  private resetTabState(role: MemberRole): void {
    const resetState = this.createDefaultState();
    if (role === 'teacher') {
      this.teacherState = resetState;
    } else {
      this.studentState = resetState;
    }
    this.scrollPositions[role] = 0;
    const el = this.getScrollContainer(role);
    if (el) {
      el.scrollTop = 0;
    }
  }

  private reloadRole(role: MemberRole): void {
    this.resetTabState(role);
    this.loadFirstPage(role);
  }

  private resetMutationForms(): void {
    this.existingQuery = '';
    this.existingUsers = [];
    this.existingUsersError = '';
    this.existingUsersLoading = false;
    this.selectedExistingUserId = null;
    this.selectedExistingDepartmentId = null;
  }

  private dedupeMembers(items: InstitutionMember[]): InstitutionMember[] {
    const map = new Map<string, InstitutionMember>();
    items.forEach((item) => {
      map.set(this.getMemberKey(item), item);
    });
    return Array.from(map.values());
  }

  private getMemberKey(item: InstitutionMember): string {
    if (item.id && item.id > 0) {
      return `id:${item.id}`;
    }

    const email = (item.email || '').trim().toLowerCase();
    const username = (item.username || '').trim().toLowerCase();
    const dept = (item.department_name || '').trim().toLowerCase();
    return `fallback:${email}|${username}|${dept}`;
  }

  private resolveMemberEntityId(member: InstitutionMember, role: MemberRole): number {
    if (role === 'teacher') {
      return Number(member.teacher_id ?? member.id ?? 0);
    }

    return Number(member.student_id ?? member.id ?? 0);
  }

  private getRowActionKey(member: InstitutionMember, role: MemberRole): string {
    const entityId = this.resolveMemberEntityId(member, role);
    return `${role}:${entityId || member.id || member.email || member.username}`;
  }

  private capitalizeRole(role: MemberRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  private captureCurrentScroll(): void {
    const el = this.getScrollContainer(this.activeTab);
    if (el) {
      this.scrollPositions[this.activeTab] = el.scrollTop;
    }
  }

  private restoreScroll(role: MemberRole): void {
    const el = this.getScrollContainer(role);
    if (el) {
      el.scrollTop = this.scrollPositions[role] || 0;
    }
  }

  private getScrollContainer(role: MemberRole): HTMLElement | null {
    if (role === 'teacher') {
      return this.teacherScroll?.nativeElement ?? null;
    }

    return this.studentScroll?.nativeElement ?? null;
  }

  private requestViewUpdate(): void {
    if (this.destroyed) {
      return;
    }
    this.cdr.detectChanges();
  }
}
