import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false,
})
export class HeaderComponent implements OnInit {
  @Input() isMain = true;
  @Input() isNeutral = false;

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;

  titlePage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit(): void {
    this.isLogged = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  login(): void {
    this.router.navigate(['iniciarsesion']);
  }

  logout(): void {}

  goToMyDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.getElementById('navbar');
    const logo = document.getElementById('logo') as HTMLImageElement;
    const targetElement = document.getElementById('target-element');
    const changeableButtons = document.querySelectorAll('.changeable-button');

    if (this.isMain) {
      if (navbar && targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top;
        const navbarHeight = navbar.offsetHeight;

        if (targetPosition <= navbarHeight) {
          navbar.classList.add('bg-light');
          if (logo) {
            logo.src =
              'https://garbrix.com/intelipadel/assets/images/logo_intelipadel.png'; // Change to default logo
          }
          changeableButtons.forEach((button) => {
            button.classList.remove('btn-outline-light');
            button.classList.add('btn-outline-dark');
          });
        } else {
          navbar.classList.remove('bg-light');
          if (logo) {
            logo.src =
              'https://garbrix.com/intelipadel/assets/images/logo-intelipdale-white.png'; // Change to light logo
          }
          changeableButtons.forEach((button) => {
            button.classList.remove('btn-outline-dark');
            button.classList.add('btn-outline-light');
          });
        }
      }
    } else {
      if (navbar) {
        navbar.classList.add('bg-light');
        if (logo) {
          logo.src =
            'https://garbrix.com/intelipadel/assets/images/logo_intelipadel.png'; // Change to default logo
        }
        changeableButtons.forEach((button) => {
          button.classList.remove('btn-outline-light');
          button.classList.add('btn-outline-dark');
        });
      }
    }
  }
}
