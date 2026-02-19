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
import { SelectInput } from './components/select-input/select-input';
import { Snackbar } from './components/modals/snackbar/snackbar';
import { SnackbarContainer } from './components/modals/snackbar/snackbar-container/snackbar-container';
import { Popup } from './components/modals/popup/popup';
import { PopupContainer } from './components/modals/popup/popup-container/popup-container';
import { List } from './components/list/list';
import { PermissionElement } from './components/permission-element/permission-element';
import { Note } from './components/note/note';
import { InsertRow } from './components/modals/insert-row/insert-row';
import { InsertRowContainer } from './components/modals/insert-row/insert-row-container/insert-row-container';
import { InfiniteScrollDirective } from './directives/infinite-scroll/infinite-scroll.directive';

@NgModule({
  declarations: [
    TextInput, 
    DynamicTableComponent, 
    ResizableColumnComponent, 
    ChipInputComponent, 
    SidenavComponent, 
    AppDynamicTableCell, 
    Navbar, 
    SelectInput,
    Snackbar,
    SnackbarContainer,
    Popup,
    PopupContainer,
    List,
    PermissionElement,
    Note,
    InsertRow,
    InsertRowContainer,
    InfiniteScrollDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TextInput, 
    DynamicTableComponent, 
    ResizableColumnComponent, 
    ChipInputComponent, 
    SidenavComponent, 
    AppDynamicTableCell, 
    Navbar, 
    SelectInput,
    Snackbar,
    SnackbarContainer,
    Popup,
    PopupContainer,
    List,
    PermissionElement,
    Note,
    InsertRow,
    InsertRowContainer,
    InfiniteScrollDirective
  ]
})
export class SharedModule { }
