import { Component } from '@angular/core';
import environmentJson from '../../../../../../configs/environment.json';
import { AuthService } from '../../../../services/http/auth.service';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  isAdmin = localStorage.getItem(environmentJson.IS_SUPER_ADMIN) === 'true'
  adminPanel: any = [{
    'label': 'Dashboard', 'route': '/admin/dashboard', 'title': 'Admin Panel', 'subtitle': 'Manage your data from here'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle': 'Your Notification'
  }, {
    'label': 'Permission', 'route': '/admin/permissions', 'title': 'Permission', 'subtitle': 'Grant and manage permissions'
  }]

  studentName: string = '';

  constructor(private authService: AuthService) {
    const user = this.authService.getUser();
    if (user && user.username) {
      this.studentName = user.username;
    }
  }

  userPanel: any = [{
    'label': 'Semesters', 'route': '/user/semesters', 'title': 'Student Panel', 'subtitle': 'View your semesters and marks'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }]

}
