import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TableDescription, Column, TypeMap, ColumnType } from '../../../types/admin.types';
@Component({
  selector: 'app-dynamic-table',
  standalone: false,
  templateUrl: './dynamic-table.html',
  styleUrls: ['./dynamic-table.css']
})
export class DynamicTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Output() cellUpdate = new EventEmitter<{ rowIndex: number; column: string; newValue: any; oldValue: any }>();
  editingCell: { rowIndex: number; column: string } | null = null;
  editValue: any = null;
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
  private scrollThreshold: number = 200; 

  ngOnInit(): void {
    if (this.tableDescription) {
      this.processTableDescription();
    }
  }

  startEditCell(rowIndex: number, column: string, value: any): void {
    this.editingCell = { rowIndex, column };
    this.editValue = value;
  }

  saveEditCell(rowIndex: number, column: string, row: any): void {
    const oldValue = row[column];
    row[column] = this.editValue;
    this.cellUpdate.emit({ rowIndex, column, newValue: this.editValue, oldValue });
    this.editingCell = null;
    this.editValue = null;
  }


  cancelEditCell(): void {
    this.editingCell = null;
    this.editValue = null;
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

    this.displayColumns = this.tableDescription.columns.map(col => col.name);

    this.tableDescription.columns.forEach(col => {
      this.columnMetadata.set(col.name, col);
    });

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

    const nearBottom = scrollHeight - scrollTop - clientHeight < this.scrollThreshold;

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

  getColumnType(columnName: string): ColumnType {
    const column = this.columnMetadata.get(columnName);
    if (TypeMap[column?.type || 0] === 'boolean') return 'boolean';
    else if (TypeMap[column?.type || 0] === 'varchar') return 'varchar';
    else if (TypeMap[column?.type || 0] === 'text') return 'text';
    else if (TypeMap[column?.type || 0] === 'integer' || TypeMap[column?.type || 0] === 'bigint' || TypeMap[column?.type || 0] === 'smallint') return 'int';
    else if (TypeMap[column?.type || 0] === 'real' || TypeMap[column?.type || 0] === 'double precision' || TypeMap[column?.type || 0] === 'numeric') return 'float';
    else if (TypeMap[column?.type || 0] === 'date') return 'date';
    else if (TypeMap[column?.type || 0] === 'timestamp') return 'timestamp';
    else return 'varchar';
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
