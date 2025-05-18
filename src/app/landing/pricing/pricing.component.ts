import { Component } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pricing',
  standalone: false,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  isSuscribtionPage = false;
  subsType = 0;

  faCheck = faCheck;

  goToSuscribtionPage(type: number) {
    this.subsType = type;
    this.isSuscribtionPage = true;
  }
}
