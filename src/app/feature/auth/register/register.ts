import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';
import { SnackbarService } from '../../../services/modal/snackbar.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  private cleanupListeners: Array<() => void> = [];

  ngAfterViewInit(): void {
    const body = document.querySelector('body') as HTMLElement;
    const modal = document.querySelector('.modal') as HTMLElement;
    const modalButton = document.querySelector('.modal-button') as HTMLElement;
    const closeButton = document.querySelector('.close-button') as HTMLElement;
    const scrollDown = document.querySelector('.scroll-down') as HTMLElement;

    const openModal = () => {
      modal.classList.add('is-open');
      body.style.overflow = 'hidden';
      if (scrollDown) {
        scrollDown.style.display = 'none';
      }
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      body.style.overflow = 'initial';
    };

    openModal();

    if (modalButton) {
      modalButton.addEventListener('click', openModal);
      this.cleanupListeners.push(() => modalButton.removeEventListener('click', openModal));
    }

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
      this.cleanupListeners.push(() => closeButton.removeEventListener('click', closeModal));
    }

    const onKeyDown = (evt: KeyboardEvent) => {
      evt.key === 'Escape' ? closeModal() : false;
    };
    document.addEventListener('keydown', onKeyDown);
    this.cleanupListeners.push(() => document.removeEventListener('keydown', onKeyDown));
  }

  ngOnDestroy(): void {
    this.cleanupListeners.forEach((cleanup) => cleanup());
    this.cleanupListeners = [];
    document.body.style.overflow = 'initial';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

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
      await this.authService.register(this.email.trim(), this.password, this.fullName.trim(), 'institution');
      this.snackbarService.success('Account created successfully');
      document.body.style.overflow = 'initial';
      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Sign up failed. Please try again.';
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    document.body.style.overflow = 'initial';
    this.router.navigate(['/auth/login']);
  }
}
