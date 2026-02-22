import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertRow } from './insert-row';

describe('InsertRow', () => {
  let component: InsertRow;
  let fixture: ComponentFixture<InsertRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
