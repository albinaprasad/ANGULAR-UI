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
  isAdmin = false;
  isTeacher = false;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.isTeacher = this.authService.isTeacher();
    const user = this.authService.getUser();
    if (user && user.username) {
      this.studentName = user.username;
    }
  }

  adminPanel: any = [{
    'label': 'Dashboard', 'route': '/admin/dashboard', 'title': 'Admin Panel', 'subtitle': 'Manage your data from here'
  }, {
    'label': 'Permission', 'route': '/admin/permissions', 'title': 'Permission', 'subtitle': 'Grant and manage permissions'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }, {
    'label': 'Notification', 'route': '/user/notification', 'title': 'Notification', 'subtitle': 'Your Notification'
  }];

  teacherPanel: any = [{
    'label': 'Teacher Section', 'route': '/teacher/dashboard', 'title': 'TEACHER', 'subtitle': 'Evaluate student uploads'
  }, {
    'label': 'Marks', 'route': '/teacher/marks', 'title': 'TEACHER', 'subtitle': 'View academic progress'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'TEACHER', 'subtitle': 'Edit and save your profile'
  }];

  userPanel: any = [{
    'label': 'Semesters', 'route': '/user/semesters', 'title': 'Student Panel', 'subtitle': 'View your semesters and marks'
  }, {
    'label': 'Profile', 'route': '/user/profile', 'title': 'Profile', 'subtitle': 'Edit and save your profile'
  }];

  studentName: string = '';

  // Constructor moved to top for role initialization

}
