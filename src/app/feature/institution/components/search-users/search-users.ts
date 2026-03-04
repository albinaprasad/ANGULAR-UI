import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardUser } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-search-users',
  standalone: false,
  templateUrl: './search-users.html',
  styleUrl: './search-users.css'
})
export class SearchUsersComponent {
  @Input() users: DashboardUser[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';
  @Input() selectedUserId: number | null = null;

  @Output() searchRequested = new EventEmitter<{ role: 'teacher' | 'student'; query: string }>();
  @Output() userSelected = new EventEmitter<DashboardUser>();

  role: 'teacher' | 'student' = 'teacher';
  query = '';
  hasSearched = false;

  search(): void {
    const trimmedQuery = this.query.trim();
    if (!trimmedQuery) {
      return;
    }

    this.hasSearched = true;
    this.searchRequested.emit({ role: this.role, query: trimmedQuery });
  }

  onRoleChange(value: string): void {
    if (value === 'teacher' || value === 'student') {
      this.role = value;
    }
  }

  selectUser(user: DashboardUser): void {
    this.userSelected.emit(user);
  }

  resolveRole(user: DashboardUser): string {
    if (Array.isArray(user.role)) {
      return user.role.join(', ');
    }

    return user.role || '-';
  }
}
