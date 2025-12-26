import { Component, AfterViewInit } from '@angular/core';
import { TextInput } from '../shared/components/text-input/text-input';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TextInput],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {

  // Controls Login / Signup UI
  isSignup: boolean = false;

  switchToSignup() {
    this.isSignup = true;
  }

  switchToLogin() {
    this.isSignup = false;
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
}
