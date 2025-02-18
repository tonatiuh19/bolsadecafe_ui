import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingMaskComponent } from './loading-mask.component';

@NgModule({
  declarations: [LoadingMaskComponent],
  imports: [CommonModule],
  exports: [LoadingMaskComponent],
})
export class LoadingMaskModule {}
