import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertRowContainer } from './insert-row-container';

describe('InsertRowContainer', () => {
  let component: InsertRowContainer;
  let fixture: ComponentFixture<InsertRowContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertRowContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertRowContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
