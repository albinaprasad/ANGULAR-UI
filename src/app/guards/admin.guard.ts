import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate{
  constructor() {}

  canActivate(): boolean {
    // Implement your logic to check if the user has admin privileges
    // For example, you can check the user's role from a service or token
    // const userRole = 'admin'; // Replace with actual role checking logic

    // if (userRole === 'admin') {
    //   return true; // Allow access to admin routes
    // } else {
    //   return false; // Deny access to non-admin users
    // }
    return true; // Placeholder: Allow access for now, replace with actual logic
  }
}
