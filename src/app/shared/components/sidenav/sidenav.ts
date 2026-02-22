import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: false,
  templateUrl: './sidenav.html',
  styleUrls: ['./sidenav.css']
})
export class SidenavComponent {
  @Input() navItems: NavItem[] = [];
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Navigation';

  @Output() itemSelected = new EventEmitter<string>();
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() navItemsReordered = new EventEmitter<NavItem[]>();

  dragIndex: number | null = null;
  overIndex: number | null = null;

  selectItem(itemId: string): void {
    this.itemSelected.emit(itemId);
  }

  toggle(): void {
    this.toggleSidenav.emit();
  }

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.overIndex = index;
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex;
    const toIndex = index;
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    const updated = [...this.navItems];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    this.navItemsReordered.emit(updated);
    this.dragIndex = null;
    this.overIndex = null;
  }

  onDragEnd(): void {
    this.dragIndex = null;
    this.overIndex = null;
  }
}