import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionAction, PermissionToggleChange, TablePermissions } from '../../../types/permission.types';

@Component({
  selector: 'app-permission-element',
  standalone: false,
  templateUrl: './permission-element.html',
  styleUrl: './permission-element.css',
})
export class PermissionElement {
  @Input({ required: true }) permission!: TablePermissions;
  @Output() permissionChange = new EventEmitter<PermissionToggleChange>();

  togglePermission(action: PermissionAction, checked: boolean): void {
    this.permissionChange.emit({
      table: this.permission.table,
      action,
      assigned: checked
    });
  }
}
