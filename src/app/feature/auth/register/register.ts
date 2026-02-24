import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';
import { SnackbarService } from '../../../services/modal/snackbar.service';
import { PopupService } from '../../../services/modal/popup.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements AfterViewInit {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  selectedRole: 'student' | 'teacher' = 'student';
  isLoading = false;
  errorMessage = '';

  ngAfterViewInit(): void {
    const body = document.querySelector("body") as HTMLElement;
    const modal = document.querySelector(".modal") as HTMLElement;
    const modalButton = document.querySelector(".modal-button") as HTMLElement;
    const closeButton = document.querySelector(".close-button") as HTMLElement;
    const scrollDown = document.querySelector(".scroll-down") as HTMLElement;

    const openModal = () => {
      modal.classList.add("is-open");
      body.style.overflow = "hidden";
      if (scrollDown) {
        scrollDown.style.display = "none";
      }
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      body.style.overflow = "initial";
    };

    // Register form should be visible immediately.
    openModal();

    if (modalButton) {
      modalButton.addEventListener("click", openModal);
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    document.onkeydown = (evt: KeyboardEvent) => {
      evt.key === 'Escape' ? closeModal() : false;
    };
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private popupService: PopupService,
    private ngZone: NgZone
  ) { }

  fullNameChanged(value: string): void {
    this.fullName = value;
    this.errorMessage = '';
  }

  emailChanged(value: string): void {
    this.email = value;
    this.errorMessage = '';
  }

  passwordChanged(value: string): void {
    this.password = value;
    this.errorMessage = '';
  }

  confirmPasswordChanged(value: string): void {
    this.confirmPassword = value;
    this.errorMessage = '';
  }

  selectRole(role: 'student' | 'teacher'): void {
    this.selectedRole = role;
  }

  async register(): Promise<void> {
    if (!this.fullName.trim() || !this.email.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.register(this.email.trim(), this.password, this.fullName.trim(), this.selectedRole);

      if (response && response.error) {
        this.ngZone.run(() => {
          this.errorMessage = response.error || '';
          this.isLoading = false;
          this.popupService.show('Registration Failed', response.error || '');
        });
        return;
      }

      this.snackbarService.success('Account created successfully');

      // Close modal before navigating
      const body = document.querySelector("body") as HTMLElement;
      const modal = document.querySelector(".modal") as HTMLElement;
      if (modal) {
        modal.classList.remove("is-open");
        body.style.overflow = "initial";
      }

      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.ngZone.run(() => {
        const errorMsg = error?.error?.message || error?.error?.error || 'Sign up failed. Please try again.';
        this.errorMessage = errorMsg;
        this.popupService.show('Registration Failed', errorMsg);
        this.isLoading = false;
      });
      console.error('Registration error:', error);
    } finally {
      // Keep finally for safety if needed, but the zone run handles the main error case now
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
