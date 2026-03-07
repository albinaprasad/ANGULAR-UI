import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModalCloseService } from '../../../services/modal/modal-close.service';

@Component({
  selector: 'app-pdf-upload-modal',
  standalone: false,
  templateUrl: './pdf-upload-modal.html',
  styleUrl: './pdf-upload-modal.css',
})
export class PdfUploadModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = 'Upload PDF';
  @Input() studentName = '';
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() upload = new EventEmitter<File>();

  selectedFile: File | null = null;
  errorMessage = '';
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly modalCloseService: ModalCloseService) {}

  ngOnInit(): void {
    this.modalCloseService.closeAll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isOpen) return;
      this.forceClose();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.selectedFile = null;
      this.errorMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    if (this.loading) return;
    this.closed.emit();
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.selectedFile = null;
    this.errorMessage = '';

    if (!file) return;

    const isPdfMime = file.type === 'application/pdf';
    const isPdfName = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfName) {
      this.errorMessage = 'Please select a PDF file.';
      return;
    }

    this.selectedFile = file;
  }

  submit(): void {
    if (!this.selectedFile || this.loading) return;
    this.upload.emit(this.selectedFile);
  }

  private forceClose(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.closed.emit();
  }
}
