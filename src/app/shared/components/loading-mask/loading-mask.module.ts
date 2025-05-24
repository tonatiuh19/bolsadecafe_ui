import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingMaskComponent } from './loading-mask.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [LoadingMaskComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [LoadingMaskComponent],
})
export class LoadingMaskModule {}
