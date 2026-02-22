import { Component, Input, OnInit } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { DataService } from '../../../../services/http/data.service';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { InsertRowService } from '../../../../services/modal/insert-row.service';
import { TableDescription, TypeMap } from '../../../../types/admin.types';
import { CellType } from '../../app-dynamic-table-cell/app-dynamic-table-cell';
import { BaseResponse } from '../../../../types/base-http.types';

@Component({
  selector: 'app-insert-row',
  standalone: false,
  templateUrl: './insert-row.html',
  styleUrl: './insert-row.css',
})
export class InsertRow implements OnInit{

  @Input() table: TableDescription = {
    table: '',
    columns: []
  };

  tableDes: {
    table: string,
    columns: {
      name: string,
      null : boolean;
      type : string,
      foreignKey: []
    }[]
  }  = {
    table: '',
    columns: [{
      name: '',
      null: true,
      type : '',
      foreignKey: []
    }]
  }

  rowValues: Record<string, any> = {};
  fieldErrors: Record<string, string> = {};
  submitError = '';
  isSubmitting = false;

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private insertRowService: InsertRowService
  ) {}

  ngOnInit(): void {
    this.tableDes.table = this.table.table
    this.tableDes.columns = this.table.columns
      .filter((column) => column.name !== 'id')
      .map(column => {
        return {
          name: column.name,
          null: column.null,
          type: TypeMap[column.type],
          foreignKey: column.foreignKey ?? []
        }
      });

    this.tableDes.columns.forEach(column => {
      this.rowValues[column.name] = null;
    });
  }

  onFieldChange(columnName: string, value: any): void {
    this.rowValues[columnName] = value;
    if (this.fieldErrors[columnName]) {
      delete this.fieldErrors[columnName];
    }
    if (this.submitError) {
      this.submitError = '';
    }
  }

  onInsert(): void {
    this.submitError = '';
    this.fieldErrors = {};

    if (!this.validateRequiredFields()) {
      this.submitError = 'Please fill all required NOT NULL fields.';
      this.snackbarService.warning(this.submitError);
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;
    this.dataService
      .insertTableRow(this.tableDes.table, payload)
      .pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
      next: (res: BaseResponse<any, string>) => {
        console.log(res)
        if (res?.error) {
          this.submitError = typeof res.error === 'string' ? res.error : 'Failed to insert row';
          this.snackbarService.error(this.submitError);
          return;
        }

        this.snackbarService.success('Row inserted successfully');
        this.insertRowService.close();
      },
      error: (err) => {
        this.submitError = err?.error?.error || err?.error?.message || 'Failed to insert row';
        this.snackbarService.error(this.submitError);
      }
    });
  }

  private validateRequiredFields(): boolean {
    let isValid = true;

    for (const column of this.tableDes.columns) {
      const value = this.rowValues[column.name];
      if (!column.null && this.isEmpty(value)) {
        this.fieldErrors[column.name] = `${column.name} is required`;
        isValid = false;
      }
    }

    return isValid;
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
  }

  private buildPayload(): Record<string, any> {
    const payload: Record<string, any> = {};
    for (const column of this.tableDes.columns) {
      const value = this.rowValues[column.name];
      payload[column.name] = value === undefined ? null : value;
    }
    return payload;
  }

  getCellType(dbType: string): CellType {
    switch (dbType) {
      case 'boolean':
        return 'boolean';
      case 'varchar':
        return 'varchar';
      case 'text':
        return 'text';
      case 'date':
        return 'date';
      case 'timestamp':
        return 'timestamp';
      case 'integer':
      case 'smallint':
      case 'bigint':
        return 'int';
      case 'numeric':
      case 'real':
      case 'double precision':
        return 'float';
      case 'time':
      default:
        return 'text';
    }
  }

}
