import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { PricingComponent } from './landing/pricing/pricing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'suscribete', component: PricingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
