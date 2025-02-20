import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  constructor(private router: Router, private titleService: Title) {}

  goToSubscriptions() {
    this.router.navigate(['suscribete']);
  }
}
