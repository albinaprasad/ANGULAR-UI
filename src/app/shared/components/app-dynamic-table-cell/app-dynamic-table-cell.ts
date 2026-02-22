import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from '../../../services/http/data.service';

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
export class AppDynamicTableCell implements OnInit, OnChanges {

  @Input() type: CellType = 'varchar';
  @Input() value: any;
  @Input() nullable = false;
  @Input() foreignKey: string[] = [];

  @Output() valueChange = new EventEmitter<any>();

  resolvedForeignLabelKey = 'name';

  private lastResolvedTable = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.resolveForeignLabelKey();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['foreignKey']) {
      this.resolveForeignLabelKey();
    }
  }

  get hasForeignKey(): boolean {
    return Array.isArray(this.foreignKey) && this.foreignKey.length > 0;
  }

  get foreignValueKey(): string {
    return this.foreignKey?.[2] || 'id';
  }

  get foreignLabelKey(): string {
    return this.resolvedForeignLabelKey;
  }

  get foreignPlaceholder(): string {
    const tableName = this.foreignKey?.[1] || this.foreignKey?.[0] || 'reference';
    return `Select ${tableName}`;
  }

  onChange(val: any): void {
    this.valueChange.emit(this.cast(val));
  }

  private resolveForeignLabelKey(): void {
    if (!this.hasForeignKey) {
      this.resolvedForeignLabelKey = 'name';
      this.lastResolvedTable = '';
      return;
    }

    const explicitLabelKey = this.foreignKey?.[3];
    if (explicitLabelKey) {
      this.resolvedForeignLabelKey = explicitLabelKey;
      return;
    }

    const tableName = this.foreignKey?.[1] || this.foreignKey?.[0];
    if (!tableName) {
      this.resolvedForeignLabelKey = this.foreignValueKey;
      return;
    }

    if (this.lastResolvedTable === tableName) return;
    this.lastResolvedTable = tableName;

    this.dataService.getTableDescription(tableName).subscribe({
      next: (res) => {
        const columns = res?.message?.columns?.map((column) => column.name) ?? [];
        this.resolvedForeignLabelKey = this.pickBestLabelColumn(columns);
      },
      error: () => {
        this.resolvedForeignLabelKey = this.foreignValueKey;
      }
    });
  }

  private pickBestLabelColumn(columns: string[]): string {
    if (!columns.length) return this.foreignValueKey;

    const preferredNames = ['name', 'title', 'label', 'code', 'description'];
    const foundPreferred = preferredNames.find((col) => columns.includes(col));
    if (foundPreferred && foundPreferred !== this.foreignValueKey) {
      return foundPreferred;
    }

    const firstNonId = columns.find((col) => col !== this.foreignValueKey && col !== 'id');
    return firstNonId || this.foreignValueKey || columns[0];
  }

  private cast(val: any): any {
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
