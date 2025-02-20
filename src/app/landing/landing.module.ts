import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';
import { PricingModule } from './pricing/pricing.module';

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, HeaderModule, FooterModule, PricingModule],
  exports: [LandingComponent],
})
export class LandingModule {}
