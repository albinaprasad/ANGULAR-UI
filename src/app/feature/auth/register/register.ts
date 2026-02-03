import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const body = document.querySelector("body") as HTMLElement;
    const modal = document.querySelector(".modal") as HTMLElement;
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

    closeButton.addEventListener("click", closeModal);

    document.onkeydown = (evt: KeyboardEvent) => {
      evt.key === 'Escape' ? closeModal() : false;
    };
  }

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
