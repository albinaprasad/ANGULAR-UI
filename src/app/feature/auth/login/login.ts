import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  private returnUrl: string = '/admin/dashboard';

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

    window.addEventListener("scroll", () => {
      if (window.scrollY > window.innerHeight / 3 && !isOpened) {
        isOpened = true;
        scrollDown.style.display = "none";
        openModal();
      }
    });

    modalButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    document.onkeydown = (evt: KeyboardEvent) => {
      evt.key === 'Escape' ? closeModal() : false;
    };
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
      this.router.navigateByUrl(this.returnUrl);
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
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin/dashboard';
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
