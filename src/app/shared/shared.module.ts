import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInput } from './components/text-input/text-input';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table';
import { ResizableColumnComponent } from './components/resizable-column/resizable-column';
import { ChipInputComponent } from './components/chip-input/chip-input';
import { SidenavComponent } from './components/sidenav/sidenav';
import { FormsModule } from '@angular/forms';
import { AppDynamicTableCell } from './components/app-dynamic-table-cell/app-dynamic-table-cell';
import { Navbar } from './components/navbar/navbar';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent, SidenavComponent, AppDynamicTableCell, Navbar],
  imports: [CommonModule,FormsModule,RouterModule],
  exports: [TextInput, DynamicTableComponent, ResizableColumnComponent, ChipInputComponent, SidenavComponent, AppDynamicTableCell, Navbar]
})
export class SharedModule { }
