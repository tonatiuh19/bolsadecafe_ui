import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingCardsComponent } from './pricing-cards.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [PricingCardsComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [PricingCardsComponent],
})
export class PricingCardsModule {}
