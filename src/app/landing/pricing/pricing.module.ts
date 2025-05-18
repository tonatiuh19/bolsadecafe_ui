import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing.component';
import { CoffeeWizardModule } from './coffee-wizard/coffee-wizard.module';
import { HeaderModule } from '../../shared/components/header/header.module';
import { FooterModule } from '../../shared/components/footer/footer.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [PricingComponent],
  imports: [
    CommonModule,
    HeaderModule,
    FooterModule,
    CoffeeWizardModule,
    FontAwesomeModule,
  ],
  exports: [PricingComponent],
})
export class PricingModule {}
