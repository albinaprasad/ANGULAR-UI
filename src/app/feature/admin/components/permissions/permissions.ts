import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PermissionService } from '../../../../services/http/permission.service';
import { PermissionAction, Permissions, PermissionToggleChange, TablePermissions } from '../../../../types/permission.types';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { NavItem } from '../../../../shared/components/sidenav/sidenav';

@Component({
  selector: 'app-permissions',
  standalone: false,
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionsComponent implements OnInit {
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

  ngOnInit(): void {
    console.log('Permissions component initialized');
    this.fetchAllPermissions();
    this.fetchGroups();
  }

  private fetchAllPermissions(): void {
    this.permissionsService.getAllPermissions().subscribe({
      next: (response) => {
        this.allPermissions = response.message ?? [];
        this.refreshTablePermissions();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching all permissions:', err);
      }
    });
  }

  private fetchGroups(): void {
    this.permissionsService.getGroups().subscribe({
      next: (response) => {
        response.message?.forEach((group)=>{
          if(group.id === 1) {
            this.selectedGroup = String(group.id);
          }
          this.groups.push({
            id: String(group.id),
            label: group.name,
            active: group.id === 1,
            icon: '📄',
          })
        }) || [];
        console.log('Groups fetched successfully:', this.groups);
        this.cdr.markForCheck();
        this.snackbarService.success('Groups fetched successfully');
        console.log('Groups fetched successfully:', response);
        if(response.message && response.message.length > 0) {
          this.getPermissionsForGroup(Number(response.message?.[0].id));
        }
      },
      error: (err) => {
        console.error('Error fetching groups:', err);
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
    this.permissionsService.getGroupPermissions(Number(groupName)).subscribe({
      next: (response) => {
        this.currentGroupPermissions = response.message ?? [];
        this.refreshTablePermissions();
        console.log('Permissions for group fetched successfully:', response);
        this.snackbarService.success('Permissions for group fetched successfully');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching permissions for group:', err);
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
        canCreate: change.action === 'create' ? change.assigned : permission.canCreate,
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
        canCreate: false,
        canDelete: false,
        canAdd: false,
        permissionIds: {}
      };

      if (action === 'view') {
        current.canView = assignedCodenames.has(permission.codename);
      }

      if (action === 'create') {
        current.canCreate = assignedCodenames.has(permission.codename);
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
    const matched = codename.match(/^(view|add|create|change|delete)_(.+)$/i);
    if (!matched) return null;

    const rawAction = matched[1].toLowerCase();
    const table = matched[2];
    const action: PermissionAction = rawAction === 'change' ? 'create' : (rawAction as PermissionAction);

    return { action, table };
  }
}
