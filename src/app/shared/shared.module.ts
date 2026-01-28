import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInput } from './components/text-input/text-input';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table';
import { ResizableColumnComponent } from './components/resizable-column/resizable-column';
import { ChipInputComponent } from './components/chip-input/chip-input';
import { SidenavComponent } from './components/sidenav/sidenav';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent, SidenavComponent],
  imports: [CommonModule,FormsModule],
  exports: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent, SidenavComponent]
})
export class SharedModule { }
