import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chip-input',
  standalone: false,
  templateUrl: './chip-input.html',
  styleUrls: ['./chip-input.css']
})
export class ChipInputComponent {
  @Input() placeholder: string = 'Add chips...';
  @Input() chips: string[] = [];
  @Input() label: string = '';
  @Input() readonly: boolean = false;
  @Output() chipsChange = new EventEmitter<string[]>();

  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef<HTMLInputElement>;

  inputValue: string = '';

  onInputChange(event: any): void {
    console.log('chipsChange event:',this.chips);
    const value = event.target.value;
    this.inputValue = value;

    if (value.includes(',')) {
      this.addChipsFromInput(value);
    }
  }

  onInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addChipsFromInput(this.inputValue);
    } else if (event.key === 'Backspace' && !this.inputValue && this.chips.length > 0) {
      // Remove last chip when backspace is pressed on empty input
      this.removeChip(this.chips.length - 1);
    }
  }

  onInputBlur(): void {
    if (this.inputValue.trim()) {
      this.addChipsFromInput(this.inputValue);
    }
  }

  private addChipsFromInput(input: string): void {
    const newChips = input.split(',')
      .map(chip => chip.trim())
      .filter(chip => chip.length > 0)
      .filter(chip => !this.chips.includes(chip));

    if (newChips.length > 0) {
      this.chips = [...this.chips, ...newChips];
      this.chipsChange.emit(this.chips);
      this.inputValue = '';
    }
  }

  removeChip(index: number): void {
    this.chips.splice(index, 1);
    this.chipsChange.emit(this.chips);
  }

  clearAllChips(): void {
    this.chips = [];
    this.chipsChange.emit(this.chips);
  }

  focusInput(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }
}