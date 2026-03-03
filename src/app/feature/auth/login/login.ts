import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';
import { WebSocketService } from '../../../services/websocket/websocket.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  private returnUrl: string | null = null;
  private cleanupListeners: Array<() => void> = [];

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.getPostLoginRoute());
    }
  }

  ngAfterViewInit(): void {

    const body = document.querySelector("body") as HTMLElement;
    const modal = document.querySelector(".modal") as HTMLElement;
    const modalButton = document.querySelector(".modal-button") as HTMLElement;
    const closeButton = document.querySelector(".close-button") as HTMLElement;
    const scrollDown = document.querySelector(".scroll-down") as HTMLElement;

    let isOpened = false;

    const openModal = () => {
      modal.classList.add("is-open");
      body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      body.style.overflow = "initial";
    };

    const onScroll = () => {
      if (window.scrollY > window.innerHeight / 3 && !isOpened) {
        isOpened = true;
        scrollDown.style.display = "none";
        openModal();
      }
    };

    window.addEventListener("scroll", onScroll);
    modalButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    const onKeyDown = (evt: KeyboardEvent) => {
      evt.key === 'Escape' ? closeModal() : false;
    };
    document.addEventListener('keydown', onKeyDown);

    this.cleanupListeners.push(() => window.removeEventListener('scroll', onScroll));
    this.cleanupListeners.push(() => modalButton.removeEventListener('click', openModal));
    this.cleanupListeners.push(() => closeButton.removeEventListener('click', closeModal));
    this.cleanupListeners.push(() => document.removeEventListener('keydown', onKeyDown));
  }

  ngOnDestroy(): void {
    this.cleanupListeners.forEach((cleanup) => cleanup());
    this.cleanupListeners = [];
    document.body.style.overflow = 'initial';
  }

  emailChanged(value: string): void {
    this.username = value;
    this.errorMessage = '';
  }

  passwordChanged(value: string): void {
    this.password = value;
    this.errorMessage = '';
  }

  async login(): Promise<void> {
    this.authService.logout()
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.username, this.password)
      this.websocketService.disconnect();
      this.websocketService.connectToUrl('notifications');
      document.body.style.overflow = 'initial';
      this.router.navigateByUrl(this.getPostLoginRoute());
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private websocketService: WebSocketService
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  private getPostLoginRoute(): string {
    const trimmedReturnUrl = this.returnUrl?.trim();
    if (!trimmedReturnUrl || trimmedReturnUrl.startsWith('/auth/')) {
      return this.authService.getDefaultRoute();
    }

    return trimmedReturnUrl;
  }
}
