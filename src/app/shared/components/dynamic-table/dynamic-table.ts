import { Component, Input, OnInit } from '@angular/core';

export interface Column {
  name: string;
  null: boolean;
  type: number;
}

export interface TableDescription {
  table: string;
  columns: Column[];
}

@Component({
  selector: 'app-dynamic-table',
  standalone: false,
  templateUrl: './dynamic-table.html',
  styleUrls: ['./dynamic-table.css']
})
export class DynamicTableComponent implements OnInit {
  @Input() tableDescription: TableDescription | null = null;
  @Input() tableData: any[] = [];

  displayColumns: string[] = [];
  columnMetadata: Map<string, Column> = new Map();

  ngOnInit(): void {
    if (this.tableDescription) {
      this.processTableDescription();
    }
  }

  ngOnChanges(): void {
    if (this.tableDescription) {
      this.processTableDescription();
    }
  }

  private processTableDescription(): void {
    if (!this.tableDescription) return;

    // Extract column names for display
    this.displayColumns = this.tableDescription.columns.map(col => col.name);

    // Store column metadata for reference
    this.tableDescription.columns.forEach(col => {
      this.columnMetadata.set(col.name, col);
    });
  }

  getColumnType(columnName: string): string {
    const column = this.columnMetadata.get(columnName);
    if (!column) return 'unknown';

    // PostgreSQL type OID mapping
    const typeMap: { [key: number]: string } = {
      16: 'boolean',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      700: 'real',
      701: 'double precision',
      1043: 'varchar',
      1082: 'date',
      1083: 'time',
      1184: 'timestamp',
      1700: 'numeric'
    };

    return typeMap[column.type] || `type_${column.type}`;
  }

  isNullable(columnName: string): string {
    const column = this.columnMetadata.get(columnName);
    return column?.null ? 'nullable' : 'not-null';
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}
