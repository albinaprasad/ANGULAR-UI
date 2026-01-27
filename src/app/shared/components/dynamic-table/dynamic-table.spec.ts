import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicTableComponent, TableDescription } from './dynamic-table';

describe('DynamicTableComponent', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process table description on init', () => {
    const mockDescription: TableDescription = {
      table: 'auth_user',
      columns: [
        { name: 'id', null: false, type: 20 },
        { name: 'email', null: false, type: 1043 }
      ]
    };

    component.tableDescription = mockDescription;
    component.ngOnInit();

    expect(component.displayColumns).toEqual(['id', 'email']);
    expect(component.columnMetadata.size).toBe(2);
  });

  it('should format cell values correctly', () => {
    expect(component.formatCellValue(null)).toBe('NULL');
    expect(component.formatCellValue('test')).toBe('test');
    expect(component.formatCellValue(123)).toBe('123');
  });

  it('should get correct column type', () => {
    const mockDescription: TableDescription = {
      table: 'test_table',
      columns: [{ name: 'id', null: false, type: 20 }]
    };

    component.tableDescription = mockDescription;
    component.ngOnInit();

    expect(component.getColumnType('id')).toBe('bigint');
  });
});
