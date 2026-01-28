import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

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
export class DynamicTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tableDescription: TableDescription | null = null;
  @Input() tableData: any[] = [];
  @Input() enableInfiniteScroll: boolean = false;
  @Input() loading: boolean = false;

  @Output() loadMoreData = new EventEmitter<void>();

  @ViewChild('tableWrapper', { static: false }) tableWrapper!: ElementRef;

  displayColumns: string[] = [];
  columnMetadata: Map<string, Column> = new Map();
  columnWidths: number[] = [];
  filteredData: any[] = [];
  columnFilters: { [key: string]: string[] } = {};
  private scrollThreshold: number = 200; // pixels from bottom to trigger load

  ngOnInit(): void {
    if (this.tableDescription) {
      this.processTableDescription();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableDescription'] && this.tableDescription) {
      this.processTableDescription();
    }
    if (changes['tableData']) {
      this.applyFilters();
    }
  }

  ngAfterViewInit(): void {
    if (this.enableInfiniteScroll) {
      this.setupInfiniteScroll();
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

    // Initialize column widths (default 200px each)
    this.columnWidths = new Array(this.displayColumns.length).fill(200);
  }

  private setupInfiniteScroll(): void {
    if (!this.tableWrapper) return;

    const element = this.tableWrapper.nativeElement;
    element.addEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    if (!this.enableInfiniteScroll || this.loading) return;

    const element = this.tableWrapper.nativeElement;
    const { scrollTop, scrollHeight, clientHeight } = element;

    // Check if we're near the bottom
    const nearBottom = scrollHeight - scrollTop - clientHeight < this.scrollThreshold;

    // If we have active filters, be more aggressive about loading data
    // to find more matches for the current filters
    if (nearBottom || (this.hasActiveFilters() && this.filteredData.length < 20)) {
      this.loadMoreData.emit();
    }
  }

  onColumnWidthChange(columnIndex: number, newWidth: number): void {
    this.columnWidths[columnIndex] = newWidth;
  }

  getColumnChips(columnName: string): string[] {
    return this.columnFilters[columnName] || [];
  }

  onColumnChipsChange(columnName: string, chips: string[]): void {
    if (chips.length === 0) {
      delete this.columnFilters[columnName];
    } else {
      this.columnFilters[columnName] = chips;
    }
    this.applyFilters();
  }

  clearFilter(columnName: string): void {
    delete this.columnFilters[columnName];
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.columnFilters = {};
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.columnFilters).some(key => this.columnFilters[key].length > 0);
  }

  private applyFilters(): void {
    if (!this.hasActiveFilters()) {
      this.filteredData = [...this.tableData];
      return;
    }

    this.filteredData = this.tableData.filter(row => {
      return Object.keys(this.columnFilters).every(columnName => {
        const filterChips = this.columnFilters[columnName];
        if (!filterChips || filterChips.length === 0) return true;

        const cellValue = this.formatCellValue(row[columnName]).toLowerCase();
        // Check if any of the filter chips match the cell value
        return filterChips.some(chip =>
          cellValue.includes(chip.toLowerCase())
        );
      });
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
