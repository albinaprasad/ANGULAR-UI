import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-upload-status-tracker',
  standalone: false,
  templateUrl: './upload-status-tracker.html',
  styleUrl: './upload-status-tracker.css',
})
export class UploadStatusTrackerComponent {
  @Input() steps: string[] = [];
  @Input() currentStep = -1;
  @Input() isComplete = false;
  @Input() hasError = false;

  getStepState(index: number): 'complete' | 'active' | 'pending' | 'error' {
    if (this.hasError && index === this.currentStep) return 'error';
    if (index < this.currentStep) return 'complete';
    if (index === this.currentStep) {
      return this.isComplete ? 'complete' : 'active';
    }
    return 'pending';
  }
}
