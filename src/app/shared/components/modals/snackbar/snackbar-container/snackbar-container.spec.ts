import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarContainer } from './snackbar-container';

describe('SnackbarContainer', () => {
  let component: SnackbarContainer;
  let fixture: ComponentFixture<SnackbarContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackbarContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
