import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsComponent } from './permissions';

describe('Permissions', () => {
  let component: PermissionsComponent;
  let fixture: ComponentFixture<PermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
