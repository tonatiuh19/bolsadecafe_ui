import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { PricingComponent } from './landing/pricing/pricing.component';
import { SuccessPageComponent } from './shared/components/success-page/success-page.component';
import { PaymentDeclinedPageComponent } from './shared/components/payment-declined-page/payment-declined-page.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'suscribete', component: PricingComponent },
  { path: 'subscripcion-exitosa', component: SuccessPageComponent },
  { path: 'pago-declinado', component: PaymentDeclinedPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
