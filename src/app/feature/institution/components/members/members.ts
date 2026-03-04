import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InstitutionMembersService } from '../../../../services/http/institution-members.service';
import {
  InstitutionMember,
  InstitutionMembersApiError,
  MemberRole,
} from '../../../../types/institution-members.types';

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

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly scrollPositions: Record<MemberRole, number> = { teacher: 0, student: 0 };
  private destroyed = false;

  constructor(
    private institutionMembersService: InstitutionMembersService,
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
