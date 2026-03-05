import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';

@Component({
  selector: 'app-error-page',
  standalone: false,
  templateUrl: './error-page.html',
  styleUrl: './error-page.css'
})
export class ErrorPageComponent {
  title = 'Page not found';
  message = 'The page you requested does not exist or was moved.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code === '403') {
      this.title = 'Access denied';
      this.message = 'You do not have permission to access this page.';
    }
  }

  goHome(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/user/profile'], { replaceUrl: true });
      return;
    }

    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
