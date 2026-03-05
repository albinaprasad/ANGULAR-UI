import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pdf-upload-modal',
  standalone: false,
  templateUrl: './pdf-upload-modal.html',
  styleUrl: './pdf-upload-modal.css',
})
export class PdfUploadModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Upload PDF';
  @Input() studentName = '';
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() upload = new EventEmitter<File>();

  selectedFile: File | null = null;
  errorMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.selectedFile = null;
      this.errorMessage = '';
    }
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
}
