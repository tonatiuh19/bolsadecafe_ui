import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionManagementComponent } from './subscription-management.component';
import { HeaderModule } from '../../shared/components/header/header.module';
import { FooterModule } from '../../shared/components/footer/footer.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SubscriptionManagementComponent],
  imports: [CommonModule, HeaderModule, FooterModule, FormsModule],
  exports: [SubscriptionManagementComponent],
})
export class SubscriptionManagementModule {}
