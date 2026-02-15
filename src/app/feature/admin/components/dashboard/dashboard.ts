import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../services/http/data.service';
import { TableDescription, Tables, TypeMap, TypeMapJS } from '../../../../types/admin.types';
import { NavItem } from '../../../../shared/components/sidenav/sidenav';
import { ChangeDetectorRef } from '@angular/core';
import { SnackbarService } from '../../../../services/modal/snackbar.service';
import { SnackbarType } from '../../../../shared/components/modals/snackbar/type';
import { PopupService } from '../../../../services/modal/popup.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private popupService: PopupService
  ) {}

  tables: Tables = { tables: [] };
  selectedTable = '';
  sidenavOpen = true;

  tableDescriptions: Record<string, TableDescription> = {};
  tableData: Record<string, any[]> = {};
  tableLoading: Record<string, boolean> = {};
  tablePage: Record<string, number> = {};
  tableHasMore: Record<string, boolean> = {};
  editMode: boolean = false;
  private readonly pageSize = 20;


  navItems: NavItem[] = [];

  onNavItemsReordered(newOrder: NavItem[]): void {
    this.navItems = newOrder;
  }

  selectTable(tableName: string): void {
    this.selectedTable = tableName;

    this.navItems = this.navItems.map(item => ({
      ...item,
      active: item.id === tableName
    }));

    if (!this.tableData[tableName] || this.tableData[tableName].length === 0) {
      this.resetTablePagination(tableName);
      this.loadTableData(tableName, true);
    }

    this.snackbarService.show(`Fetched table ${tableName}`, SnackbarType.SUCCESS, 5000);
  }


  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }


  ngOnInit(): void {
    this.loadTables();
    
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.cdr.markForCheck();
  }

  private loadTables(): void {
    this.dataService.getTables().subscribe(res => {
      this.tables.tables = res.message ?? [];
      console.log('Loaded tables:', this.tables.tables);

      this.navItems = this.tables.tables.map((table, index) => ({
        id: table,
        label: table.replace(/_/g, ' ').toUpperCase(),
        icon: '📄',
        active: index === 0
      }))

      console.log('Nav items:', this.navItems);

      if (this.tables.tables.length > 0) {
        this.selectedTable = this.tables.tables[0];
      }
      this.snackbarService.show(`Loaded ${this.tables.tables.length} tables`, SnackbarType.SUCCESS, 3000);
      this.initializeTables();
      this.cdr.markForCheck()
    });
   
    
  }

  private initializeTables(): void {
    console.log('Initializing tables:', this.tables.tables);
    this.tables.tables.forEach(table => {
      this.tablePage[table] = 1;
      this.tableData[table] = [];
      this.tableLoading[table] = false;
      this.tableHasMore[table] = true;

      this.dataService.getTableDescription(table).subscribe(res => {
        console.log(`Table description response for ${table}:`, res);
        if (!res.message) return;

        this.tableDescriptions[table] = res.message;
        console.log(`Loaded description for table ${table}:`, res.message);

        this.loadTableData(table);
        this.cdr.markForCheck();
      });
    });
  }

  private loadTableData(table: string, reset: boolean = false): void {
    if (this.tableLoading[table]) return;
    if (!this.tableHasMore[table] && !reset) return;

    console.log(`Loading data for table ${table}, page ${this.tablePage[table]}`);

    this.tableLoading[table] = true;
    this.dataService
      .getTableData(table, this.tablePage[table], this.pageSize)
      .subscribe({
        next: (res) => {
        const response = res.message;
        const incomingRows = response?.data ?? [];

        this.tableData[table] = reset
          ? [...incomingRows]
          : [
              ...(this.tableData[table] ?? []),
              ...incomingRows
            ];

        this.tableHasMore[table] = incomingRows.length >= this.pageSize;

        this.tableLoading[table] = false;
        console.log(`Loaded data for table ${table}:`, this.tableData[table]);
        this.cdr.markForCheck();
        },
        error: (error) => {
          this.tableLoading[table] = false;
          this.cdr.markForCheck();
          console.error(`Failed to load data for table ${table}:`, error);
        }
      });

  }

  /* =========================
     UI HELPERS
     ========================= */

  getSelectedTableDescription(): TableDescription | null {
    return this.tableDescriptions[this.selectedTable] ?? null;
  }

  getSelectedTableData(): any[] {
    return this.tableData[this.selectedTable] ?? [];
  }

  getSelectedTableLoading(): boolean {
    return this.tableLoading[this.selectedTable] ?? false;
  }

  /* =========================
     PAGINATION
     ========================= */

  onLoadMoreData(): void {
    console.log('Load more data triggered for table:', this.selectedTable);
    if (!this.selectedTable) return;
    if (this.tableLoading[this.selectedTable]) return;
    if (!this.tableHasMore[this.selectedTable]) return;

    this.tablePage[this.selectedTable]++;
    this.loadTableData(this.selectedTable);
  }

  private resetTablePagination(table: string): void {
    this.tablePage[table] = 1;
    this.tableData[table] = [];
    this.tableHasMore[table] = true;
    this.tableLoading[table] = false;
  }

  /* =========================
     CELL UPDATE
     ========================= */

  onCellUpdate(event: {
    rowIndex: number;
    column: string;
    newValue: any;
    oldValue: any;
  }): void {

    if (!this.editMode) {
      this.popupService.show('Edit Mode Disabled', 'Please enable edit mode to update cells.', () => {
        this.editMode = true;
      }, () => {
        // Cancel callback, do nothing
      });
      return;
    }
    
    const table = this.selectedTable;
    const row = this.tableData[table]?.[event.rowIndex];

    if (!row) return;

    console.log(`Updating cell in table ${table}, row ${event.rowIndex}, column ${event.column} to value:`, event.newValue);
    const typeId = this.tableDescriptions[table].columns.find(col => col.name === event.column)?.type;

    const requiredType = TypeMapJS[TypeMap[typeId || 0] || ''] || 'undefined';
    const actualType = typeof event.newValue;
    let typeCheckPassed = false;

    if (actualType === requiredType) {
      typeCheckPassed = true;
      console.log(`Type check passed for column ${event.column}: ${actualType}`);
    } else {
      console.warn(`Type mismatch: expected ${requiredType}, got ${actualType}`);
    }
    
    if (typeCheckPassed)
      this.dataService.updateTableCell(
        table,
        row.id,
        [event.column],
        [event.newValue]
      ).subscribe(() => {
        // optimistic UI update
        row[event.column] = event.newValue;
      });
  }
}
