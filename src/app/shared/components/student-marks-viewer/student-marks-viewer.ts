import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StudentMark } from '../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-marks-viewer',
  standalone: false,
  templateUrl: './student-marks-viewer.html',
  styleUrl: './student-marks-viewer.css',
})
export class StudentMarksViewerComponent {
  @Input() isOpen = false;
  @Input() studentName = '';
  @Input() marks: StudentMark[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  getPercentage(mark: StudentMark): number {
    if (!mark.total_mark || mark.total_mark <= 0) return 0;
    return (mark.acquired_mark / mark.total_mark) * 100;
  }
}
