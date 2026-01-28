import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInput } from './components/text-input/text-input';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table';
import { ResizableColumnComponent } from './components/resizable-column/resizable-column';
import { ChipInputComponent } from './components/chip-input/chip-input';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent],
  imports: [CommonModule,FormsModule],
  exports: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent]
})
export class SharedModule { }
