import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataService } from '../../../services/http/data.service';

@Component({
  selector: 'app-select',
  standalone: false,
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
})
export class Select implements OnInit, OnChanges {
  @Input() tableDetails: string[] = [];
  @Input() valueKey = 'id';
  @Input() labelKey: string | string[] = 'name';
  @Input() placeholder = 'Select an option';
  @Input() disabled = false;
  @Input() nullable = false;
  @Input() pageSize = 20;
  @Input() value: any = null;

  @Output() valueChange = new EventEmitter<any>();

  options: any[] = [];
  loading = false;
  isOpen = false;
  searchTerm = '';

  private page = 1;
  hasMore = true;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMore();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableDetails'] && !changes['tableDetails'].firstChange) {
      this.resetAndReload();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeOverlay();
    }
  }

  get selectedLabel(): string {
    if (this.value === null || this.value === undefined || this.value === '') return '';

    const selected = this.options.find((option) => this.getOptionValue(option) === this.value);
    return selected ? this.getOptionLabel(selected) : String(this.value);
  }

  get filteredOptions(): any[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.options;

    return this.options.filter((option) => {
      const label = this.getOptionLabel(option).toLowerCase();
      const value = String(this.getOptionValue(option) ?? '').toLowerCase();
      return label.includes(query) || value.includes(query);
    });
  }

  openOverlay(): void {
    if (this.disabled) return;

    this.isOpen = true;
    if (!this.options.length) {
      this.loadMore();
    }
  }

  closeOverlay(): void {
    this.isOpen = false;
    this.searchTerm = '';
  }

  clearSelection(): void {
    if (!this.nullable) return;

    this.value = null;
    this.valueChange.emit(null);
    this.closeOverlay();
  }

  selectOption(option: any): void {
    this.value = this.getOptionValue(option);
    this.valueChange.emit(this.value);
    this.closeOverlay();
  }

  loadMore(): void {
    const tableName = this.tableDetails?.[1] || this.tableDetails?.[0];
    if (!tableName || this.loading || !this.hasMore) return;

    this.loading = true;
    this.dataService.getTableData(tableName, this.page, this.pageSize).subscribe({
      next: (res) => {
        const incoming = res?.message?.data ?? [];
        this.options = [...this.options, ...incoming];
        this.page++;
        this.hasMore = incoming.length >= this.pageSize;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getOptionLabel(option: any): string {
    if (option == null) return '';
    if (typeof option === 'string' || typeof option === 'number') return String(option);

    const labelKeys = Array.isArray(this.labelKey) ? this.labelKey : [this.labelKey];
    const parts = labelKeys
      .map((key) => option?.[key])
      .filter((value) => value !== undefined && value !== null && value !== '');

    if (parts.length > 0) {
      return parts.map((part) => String(part)).join(' | ');
    }

    return String(option[this.valueKey] ?? '');
  }

  getOptionValue(option: any): any {
    if (option == null) return '';
    if (typeof option === 'string' || typeof option === 'number') return option;
    return option[this.valueKey];
  }

  isSelected(option: any): boolean {
    return this.getOptionValue(option) === this.value;
  }

  trackByOption = (index: number, option: any): any => {
    return this.getOptionValue(option) ?? index;
  };

  private resetAndReload(): void {
    this.options = [];
    this.page = 1;
    this.hasMore = true;
    this.loading = false;
    this.searchTerm = '';
    this.loadMore();
  }
}
