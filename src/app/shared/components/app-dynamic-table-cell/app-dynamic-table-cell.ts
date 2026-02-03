import { Component, Input, Output, EventEmitter } from '@angular/core';

export type CellType =
  | 'boolean'
  | 'varchar'
  | 'text'
  | 'int'
  | 'float'
  | 'date'
  | 'timestamp';

@Component({
  selector: 'app-dynamic-cell-editor',
  templateUrl: './app-dynamic-table-cell.html',
  standalone: false,
  styleUrls: ['./app-dynamic-table-cell.css']
})
export class AppDynamicTableCell {

  @Input() type: CellType = 'varchar';
  @Input() value: any;
  @Input() nullable = false;

  @Output() valueChange = new EventEmitter<any>();

  onChange(val: any) {
    this.valueChange.emit(this.cast(val));
  }

  private cast(val: any) {
    if (val === '' && this.nullable) return null;

    switch (this.type) {
      case 'int':
        return Number.parseInt(val, 10);
      case 'float':
        return Number.parseFloat(val);
      case 'boolean':
        return val === 'true' || val === true;
      case 'date':
        return val ? new Date(val).toISOString().split('T')[0] : null;
      case 'timestamp':
        return val ? new Date(val).toISOString() : null;
      default:
        return val;
    }
  }
}
