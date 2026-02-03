import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDynamicTableCell } from './app-dynamic-table-cell';

describe('AppDynamicTableCell', () => {
  let component: AppDynamicTableCell;
  let fixture: ComponentFixture<AppDynamicTableCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDynamicTableCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDynamicTableCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
