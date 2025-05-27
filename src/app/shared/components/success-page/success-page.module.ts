import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuccessPageComponent } from './success-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [SuccessPageComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [SuccessPageComponent],
})
export class SuccessPageModule {}
