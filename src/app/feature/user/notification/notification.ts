import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/http/notification.service';
import { Notification } from '../../../types/notification.types';

@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent implements OnInit{
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.fetchNotifications().subscribe({
      next: (response) => {
        if (!response.error && response.message) {
          this.notifications = response.message;
        }
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      }
    });
  }

}
