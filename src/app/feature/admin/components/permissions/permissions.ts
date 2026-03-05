import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PermissionService } from '../../../../services/http/permission.service';
import { PermissionAction, Permissions, PermissionToggleChange, TablePermissions } from '../../../../types/permission.types';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { NavItem } from '../../../../shared/components/sidenav/sidenav';
import { BaseResponse } from '../../../../types/base-http.types';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'app-permissions',
  standalone: false,
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionsComponent implements OnInit {
  private readonly permissionsPageSize = 200;
  private readonly maxPermissionPages = 100;

  constructor(
    private permissionsService: PermissionService,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService
  ) {}

  groups: NavItem[] = [];
  selectedGroup: string = '';
  tablePermissions: TablePermissions[] = [];
  allPermissions: Permissions[] = [];
  currentGroupPermissions: Permissions[] = [];
  pageErrorMessage = '';
  private pendingRequests = 0;
  isLoading = false;

  ngOnInit(): void {
    console.log('Permissions component initialized');
    this.fetchAllPermissions();
    this.fetchGroups();
  }

  private fetchAllPermissions(): void {
    this.beginRequest();
    this.fetchPermissionsAcrossPages((page, pageSize) =>
      this.permissionsService.getAllPermissions({ page, pageSize })
    ).subscribe({
      next: (permissions) => {
        this.allPermissions = permissions;
        console.log('[permissions] all permissions count:', this.allPermissions.length);
        this.refreshTablePermissions();
        this.cdr.markForCheck();
        this.endRequest();
      },
      error: (err) => {
        console.error('Error fetching all permissions:', err);
        this.pageErrorMessage = 'Unable to load permissions from server.';
        this.endRequest();
      }
    });
  }

  private fetchGroups(): void {
    this.beginRequest();
    this.permissionsService.getGroups().subscribe({
      next: (response) => {
        const groupItems = (response.message ?? []).map((group) => {
          if (group.id === 1) {
            this.selectedGroup = String(group.id);
          }
          return {
            id: String(group.id),
            label: group.name,
            active: group.id === 1,
            icon: '📄',
          };
        });
        this.groups = groupItems;
        console.log('Groups fetched successfully:', this.groups);
        this.cdr.markForCheck();
        this.snackbarService.success('Groups fetched successfully');
        console.log('Groups fetched successfully:', response);
        if(response.message && response.message.length > 0) {
          this.getPermissionsForGroup(Number(response.message?.[0].id));
        }
        this.endRequest();
      },
      error: (err) => {
        console.error('Error fetching groups:', err);
        this.pageErrorMessage = 'Unable to load roles from server.';
        this.endRequest();
      }
    });
  }

  toggleSidenav() {
    // Implement sidenav toggle logic if needed
  }

  onGroupSelected(groupName: string) {
    console.log('Selected group ID:', groupName);
    this.selectedGroup = groupName;

    this.groups = this.groups.map(item => ({
      ...item,
      active: item.id === groupName
    }));

    this.getPermissionsForGroup(Number(groupName));
    
  }

  getPermissionsForGroup(groupName: number) {
    this.beginRequest();
    this.fetchPermissionsAcrossPages((page, pageSize) =>
      this.permissionsService.getGroupPermissions(Number(groupName), { page, pageSize })
    ).subscribe({
      next: (permissions) => {
        this.currentGroupPermissions = permissions;
        console.log('[permissions] current group permissions count:', this.currentGroupPermissions.length, 'groupId:', groupName);
        this.refreshTablePermissions();
        console.log('Permissions for group fetched successfully');
        this.snackbarService.success('Permissions for group fetched successfully');
        this.cdr.markForCheck();
        this.endRequest();
      },
      error: (err) => {
        console.error('Error fetching permissions for group:', err);
        this.pageErrorMessage = 'Unable to load selected role permissions.';
        this.endRequest();
      }
    });
  }

  onNavItemsReordered(newOrder: NavItem[]): void {
    this.groups = newOrder;
  }

  onTablePermissionChanged(change: PermissionToggleChange): void {
    const previousState = this.tablePermissions.map((permission) => ({
      ...permission,
      permissionIds: { ...permission.permissionIds }
    }));

    const selectedGroupId = Number(this.selectedGroup);
    if (!selectedGroupId) return;

    const tablePermission = this.tablePermissions.find((permission) => permission.table === change.table);
    if (!tablePermission) {
      this.cdr.markForCheck();
      return;
    }

    this.tablePermissions = this.tablePermissions.map((permission) => {
      if (permission.table !== change.table) return permission;

      return {
        ...permission,
        canView: change.action === 'view' ? change.assigned : permission.canView,
        canChange: change.action === 'change' ? change.assigned : permission.canChange,
        canDelete: change.action === 'delete' ? change.assigned : permission.canDelete,
        canAdd: change.action === 'add' ? change.assigned : permission.canAdd
      };
    });

    const permissionId = tablePermission.permissionIds[change.action];
    if (!permissionId) {
      this.cdr.markForCheck();
      return;
    }

    this.permissionsService.updateGroupPermission(
      selectedGroupId,
      permissionId,
      change.assigned
    ).subscribe({
      next: () => {
        this.snackbarService.success('Permissions updated successfully');
      },
      error: (err) => {
        this.tablePermissions = previousState;
        this.cdr.markForCheck();
        this.snackbarService.error('Failed to update permissions');
        console.error('Error updating permissions:', err);
      }
    });
  }

  private refreshTablePermissions(): void {
    this.tablePermissions = this.mapPermissionsByTable(this.allPermissions, this.currentGroupPermissions);
    console.log('[permissions] rendered table permissions count:', this.tablePermissions.length);
  }

  private mapPermissionsByTable(allPermissions: Permissions[], assignedPermissions: Permissions[]): TablePermissions[] {
    const groupedByTable = new Map<string, TablePermissions>();
    const assignedCodenames = new Set(assignedPermissions.map((permission) => permission.codename));

    // Merge both arrays so assigned permissions are still rendered even if API lists differ.
    const mergedByCodename = new Map<string, Permissions>();
    allPermissions.forEach((permission) => mergedByCodename.set(permission.codename, permission));
    assignedPermissions.forEach((permission) => mergedByCodename.set(permission.codename, permission));

    Array.from(mergedByCodename.values()).forEach((permission) => {
      const parsedPermission = this.parseCodename(permission.codename);
      if (!parsedPermission) return;

      const { action, table } = parsedPermission;
      const current = groupedByTable.get(table) ?? {
        table,
        canView: false,
        canChange: false,
        canDelete: false,
        canAdd: false,
        permissionIds: {}
      };

      if (action === 'view') {
        current.canView = assignedCodenames.has(permission.codename);
      }

      if (action === 'change') {
        current.canChange = assignedCodenames.has(permission.codename);
      }

      if (action === 'delete') {
        current.canDelete = assignedCodenames.has(permission.codename);
      }

      if (action === 'add') {
        current.canAdd = assignedCodenames.has(permission.codename);
      }

      current.permissionIds[action] = permission.id;
      groupedByTable.set(table, current);
    });

    return Array.from(groupedByTable.values()).sort((a, b) => a.table.localeCompare(b.table));
  }

  private parseCodename(codename: string): { action: PermissionAction; table: string } | null {
    const matched = codename.match(/^(view|add|change|delete)_(.+)$/i);
    if (!matched) return null;

    const rawAction = matched[1].toLowerCase() as PermissionAction;
    const table = matched[2];
    const action: PermissionAction = rawAction;

    return { action, table };
  }

  private fetchPermissionsAcrossPages(
    fetcher: (page: number, pageSize: number) => Observable<BaseResponse<unknown, string>>
  ): Observable<Permissions[]> {
    return new Observable<Permissions[]>((subscriber: Subscriber<Permissions[]>) => {
      const mergedByCodename = new Map<string, Permissions>();
      const pageSize = this.permissionsPageSize;

      const fetchPage = (page: number): void => {
        if (page > this.maxPermissionPages) {
          subscriber.next(Array.from(mergedByCodename.values()));
          subscriber.complete();
          return;
        }

        fetcher(page, pageSize).subscribe({
          next: (response) => {
            const payload = response.message;
            const pagePermissions = this.extractPermissions(payload);
            console.log('[permissions] page', page, 'fetched count:', pagePermissions.length);
            pagePermissions.forEach((permission) => mergedByCodename.set(permission.codename, permission));

            if (this.hasNextPermissionPage(payload, page, pageSize, pagePermissions.length)) {
              fetchPage(page + 1);
              return;
            }

            subscriber.next(Array.from(mergedByCodename.values()));
            console.log('[permissions] merged unique permissions count:', mergedByCodename.size);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      };

      fetchPage(1);
    });
  }

  private extractPermissions(message: unknown): Permissions[] {
    if (Array.isArray(message)) return this.normalizePermissionArray(message);
    if (!message || typeof message !== 'object') return [];

    const payload = message as Record<string, unknown>;
    const list = payload['results'] ?? payload['data'] ?? payload['permissions'] ?? payload['items'];
    if (Array.isArray(list)) return this.normalizePermissionArray(list);
    return [];
  }

  private normalizePermissionArray(rawItems: unknown[]): Permissions[] {
    return rawItems
      .map((item) => this.normalizePermission(item))
      .filter((item): item is Permissions => item !== null);
  }

  private normalizePermission(raw: unknown): Permissions | null {
    if (!raw || typeof raw !== 'object') return null;

    const item = raw as Record<string, unknown>;
    const id = Number(item['id']);
    const name = typeof item['name'] === 'string' ? item['name'] : '';
    const codename = typeof item['codename'] === 'string' ? item['codename'] : '';

    if (!Number.isFinite(id) || !codename) return null;
    return { id, name, codename };
  }

  private hasNextPermissionPage(message: unknown, page: number, defaultPageSize: number, currentPageCount: number): boolean {
    if (!message || typeof message !== 'object') {
      return currentPageCount >= defaultPageSize;
    }

    const payload = message as Record<string, unknown>;
    if (typeof payload['has_more'] === 'boolean') return payload['has_more'];
    if (typeof payload['next'] === 'string') return payload['next'].length > 0;

    const pageSize = Number(payload['page_size'] ?? payload['pageSize'] ?? defaultPageSize);
    const total = Number(payload['count'] ?? payload['total']);
    if (Number.isFinite(total)) return page * pageSize < total;

    return currentPageCount >= pageSize;
  }

  shouldShowPageState(): boolean {
    if (this.isLoading) return false;
    if (this.pageErrorMessage) return true;
    return this.groups.length === 0 || this.tablePermissions.length === 0;
  }

  getPageStateTitle(): string {
    return this.pageErrorMessage ? 'Unable to load permissions' : 'No permission data available';
  }

  getPageStateMessage(): string {
    return this.pageErrorMessage || 'No roles or table permissions are available right now.';
  }

  getPageStateVariant(): 'empty' | 'error' {
    return this.pageErrorMessage ? 'error' : 'empty';
  }

  private beginRequest(): void {
    this.pendingRequests += 1;
    this.isLoading = true;
  }

  private endRequest(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.isLoading = this.pendingRequests > 0;
  }
}
