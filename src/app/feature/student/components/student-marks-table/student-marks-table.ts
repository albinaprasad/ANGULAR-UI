import { Component, Input } from '@angular/core';
import { StudentMark } from '../../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-marks-table',
  standalone: false,
  templateUrl: './student-marks-table.html',
  styleUrl: './student-marks-table.css'
})
export class StudentMarksTableComponent {
  @Input() marks: StudentMark[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';

  getPercentage(mark: StudentMark): number {
    if (!mark.total_mark || mark.total_mark <= 0) {
      return 0;
    }

    return (mark.acquired_mark / mark.total_mark) * 100;
  }
}
