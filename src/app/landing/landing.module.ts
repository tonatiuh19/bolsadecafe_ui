import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { HeaderModule } from '../shared/components/header/header.module';
import { FooterModule } from '../shared/components/footer/footer.module';
import { PricingModule } from './pricing/pricing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthModule } from '@auth0/auth0-angular';
import { LandingStoreModule } from '../shared/store/landing.store.module';
import { ComingSoonModule } from '../shared/components/coming-soon/coming-soon.module';
import { PricingCardsModule } from './pricing/pricing-cards/pricing-cards.module';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    LandingStoreModule,
    HeaderModule,
    FooterModule,
    PricingModule,
    FontAwesomeModule,
    ComingSoonModule,
    PricingCardsModule,
    AuthModule.forRoot({
      domain: 'dev-j2gsoxpchrmbhu67.us.auth0.com',
      clientId: '122OnVfVQTBZBbpzDS9VxerB3NH7PJpi',
      authorizationParams: {
        redirect_uri: window.location.origin,
        ui_locales: 'es-MX',
      },
    }),
  ],
  exports: [LandingComponent],
})
export class LandingModule {}
