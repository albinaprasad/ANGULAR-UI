import { Component, Input, Output, EventEmitter, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-resizable-column',
  standalone: false,
  template: `
    <div class="resizable-column" [style.width.px]="width">
      <div class="column-content">
        <ng-content></ng-content>
      </div>
      <div class="resize-handle" (mousedown)="startResize($event)"></div>
    </div>
  `,
  styles: [`
    .resizable-column {
      position: relative;
      min-width: 100px;
      max-width: 500px;
      user-select: none;
    }

    .column-content {
      padding: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .resize-handle {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      cursor: col-resize;
      background: transparent;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .resizable-column:hover .resize-handle {
      opacity: 1;
    }

    .resize-handle:hover {
      background: rgba(102, 126, 234, 0.3);
    }

    .resizing .resize-handle {
      opacity: 1;
      background: rgba(102, 126, 234, 0.5);
    }
  `]
})
export class ResizableColumnComponent implements OnChanges {
  @Input() width: number = 200;
  @Input() minWidth: number = 100;
  @Input() maxWidth: number = 500;
  @Output() widthChange = new EventEmitter<number>();

  private startX: number = 0;
  private startWidth: number = 0;
  private isResizing: boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width']) {
      // Update the element width when input changes
      this.updateElementWidth();
    }
  }

  private updateElementWidth(): void {
    const element = this.elementRef.nativeElement.querySelector('.resizable-column');
    if (element) {
      element.style.width = this.width + 'px';
    }
  }

  startResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.width;

    // Add global mouse events
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    // Add resizing class
    this.elementRef.nativeElement.classList.add('resizing');
  }

  @HostListener('dblclick')
  onDoubleClick(): void {
    this.width = 200; // Reset to default width
    this.updateElementWidth();
    this.widthChange.emit(this.width);
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.startX;
    const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, this.startWidth + deltaX));

    this.width = newWidth;
    this.updateElementWidth();
    this.widthChange.emit(this.width);
  };

  private onMouseUp = () => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.elementRef.nativeElement.classList.remove('resizing');
  };
}