import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentDeclinedPageComponent } from './payment-declined-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [PaymentDeclinedPageComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [PaymentDeclinedPageComponent],
})
export class PaymentDeclinedPageModule {}
