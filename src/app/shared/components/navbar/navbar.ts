import { Component, Input } from '@angular/core';
type NavItem = {
  label: string;
  route: string;
  icon?: string;
};

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  @Input() title: string = 'My Application';
  @Input() logoUrl: string = '';
  @Input() navItems: NavItem[] = [];
  @Input() subtitle: string = '';

  active: NavItem | null = null;
  
  selectNavItem(item: NavItem): void {
    this.active = item;
  }

  logout(): void {
    // Implement logout logic here
  }

}
