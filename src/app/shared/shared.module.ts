import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInput } from './components/text-input/text-input';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextInput, DynamicTableComponent],
  imports: [CommonModule,FormsModule],
  exports: [TextInput, DynamicTableComponent]
})
export class SharedModule { }
