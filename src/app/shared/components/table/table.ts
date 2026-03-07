import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action, ActionEmit, Column } from '../../../types/table.types';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() tableName: string = '';
  @Input() description: string = '';
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() actions: Action<any, any>[] = [];

  @Output() actionTriggered = new EventEmitter<ActionEmit<any, any>>();

  triggerAction(action: Action<any, any>, row: any) {
    if (this.isActionDisabled(action, row)) return;
    this.actionTriggered.emit({ action, row });
  }

  getHeaderLabel(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getCellValue(row: any, columnName: string): string {
    const value = row?.[columnName];
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  getBooleanValue(row: any, columnName: string): boolean {
    const value = row?.[columnName];
    return value === true || value === 1 || String(value ?? '').toLowerCase() === 'true';
  }

  isActionDisabled(action: Action<any, any>, row: any): boolean {
    if (!action.disabled) return false;
    return Boolean(action.disabled(row));
  }

  getActionHint(action: Action<any, any>, row: any): string {
    if (!this.isActionDisabled(action, row)) return '';
    if (!action.disabledHint) return 'Action unavailable';
    return typeof action.disabledHint === 'function'
      ? action.disabledHint(row)
      : action.disabledHint;
  }
}
