import { Component, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  faMugHot,
  faTruck,
  faArrowRight,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, OnDestroy {
  faMugHot = faMugHot;
  faTruck = faTruck;
  faArrowRight = faArrowRight;
  faArrowDown = faArrowDown;

  constructor(
    private router: Router,
    private titleService: Title,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');
    this.renderer.setStyle(document.body, 'max-width', '100vw');
  }

  ngOnDestroy() {
    this.renderer.removeStyle(document.body, 'overflow-x');
    this.renderer.removeStyle(document.body, 'max-width');
  }

  goToSubscriptions() {
    this.router.navigate(['suscribete']);
  }
}
