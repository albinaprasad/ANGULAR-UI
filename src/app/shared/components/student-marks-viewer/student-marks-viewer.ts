import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModalCloseService } from '../../../services/modal/modal-close.service';
import { StudentMark } from '../../../types/role-dashboard.types';

@Component({
  selector: 'app-student-marks-viewer',
  standalone: false,
  templateUrl: './student-marks-viewer.html',
  styleUrl: './student-marks-viewer.css',
})
export class StudentMarksViewerComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() studentName = '';
  @Input() marks: StudentMark[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';
  @Output() closed = new EventEmitter<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly modalCloseService: ModalCloseService) {}

  ngOnInit(): void {
    this.modalCloseService.closeAll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isOpen) return;
      this.closed.emit();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.closed.emit();
  }

  getPercentage(mark: StudentMark): number {
    if (!mark.total_mark || mark.total_mark <= 0) return 0;
    return (mark.acquired_mark / mark.total_mark) * 100;
  }
}
