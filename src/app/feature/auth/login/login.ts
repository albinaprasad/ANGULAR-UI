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
  private returnUrl: string | null = null;

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
    console.log('Login clicked. Starting bypass flow...');
    this.authService.logout();

    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      console.log('Timeout finished. Redirecting to /user/semesters...');

      // Close modal to actually show the page we are redirecting to
      const body = document.querySelector("body") as HTMLElement;
      const modal = document.querySelector(".modal") as HTMLElement;
      if (modal) {
        modal.classList.remove("is-open");
        body.style.overflow = "initial";
      }

      this.isLoading = false;
      this.router.navigateByUrl('/user/semesters');
    }, 500); // Small delay to simulate loading
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
