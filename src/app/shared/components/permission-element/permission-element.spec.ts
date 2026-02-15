import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionElement } from './permission-element';

describe('PermissionElement', () => {
  let component: PermissionElement;
  let fixture: ComponentFixture<PermissionElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionElement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
