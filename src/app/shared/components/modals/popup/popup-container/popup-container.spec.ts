import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupContainer } from './popup-container';

describe('PopupContainer', () => {
  let component: PopupContainer;
  let fixture: ComponentFixture<PopupContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
