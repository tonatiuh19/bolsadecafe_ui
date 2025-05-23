import {
  AfterViewChecked,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pricing',
  standalone: false,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent implements OnInit, OnDestroy, AfterViewChecked {
  isSuscribtionPage = false;
  subsType = 0;

  faCheck = faCheck;

  private lastSuscribtionPage = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    // Initial styles
    this.applyBodyStyles();
  }

  ngOnDestroy() {
    this.removeBodyStyles();
  }

  goToSuscribtionPage(type: number) {
    this.subsType = type;
    this.isSuscribtionPage = true;
  }

  ngAfterViewChecked() {
    if (this.isSuscribtionPage !== this.lastSuscribtionPage) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.lastSuscribtionPage = this.isSuscribtionPage;
    }
    // Always apply styles when showing pricing
    if (!this.isSuscribtionPage) {
      this.applyBodyStyles();
    }
  }

  private applyBodyStyles() {
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');
    this.renderer.setStyle(document.body, 'max-width', '100vw');
  }

  private removeBodyStyles() {
    this.renderer.removeStyle(document.body, 'overflow-x');
    this.renderer.removeStyle(document.body, 'max-width');
  }
}
