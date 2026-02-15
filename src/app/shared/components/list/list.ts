import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnChanges{
  
  @Input() title: string = '';
  @Input() subtitle: string = '';

  @Input() actions: {
    name: string;
    callback: () => void;
  }[] = [];

  @Input() items: any[] = [];

  columns: string[] = ['name', 'description', 'actions'];
  search = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.items && this.items.length > 0) {
      this.columns = Object.keys(this.items[0]);
    }
  }

  triggerAction(action:any, item:any) {
    action.callback(item);
  }

  onCreate() {}
  onEdit(item:any) {}
  onDelete(item:any) {}
}
