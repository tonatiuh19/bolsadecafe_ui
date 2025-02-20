import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing.component';
import { CoffeeWizardModule } from './coffee-wizard/coffee-wizard.module';

@NgModule({
  declarations: [PricingComponent],
  imports: [CommonModule, CoffeeWizardModule],
  exports: [PricingComponent],
})
export class PricingModule {}
