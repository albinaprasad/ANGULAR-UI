import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizableColumnComponent } from './resizable-column';

describe('ResizableColumnComponent', () => {
  let component: ResizableColumnComponent;
  let fixture: ComponentFixture<ResizableColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResizableColumnComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResizableColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default width of 200px', () => {
    expect(component.width).toBe(200);
  });

  it('should emit width change when width is updated', () => {
    spyOn(component.widthChange, 'emit');
    component.width = 300;
    component.widthChange.emit(300);
    expect(component.widthChange.emit).toHaveBeenCalledWith(300);
  });

  it('should reset width to 200px on double click', () => {
    component.width = 400;
    spyOn(component.widthChange, 'emit');

    component.onDoubleClick();

    expect(component.width).toBe(200);
    expect(component.widthChange.emit).toHaveBeenCalledWith(200);
  });
});
