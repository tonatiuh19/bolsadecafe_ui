import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoffeeWizardComponent } from './coffee-wizard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [CoffeeWizardComponent],
  imports: [CommonModule, ReactiveFormsModule, StepperModule, ButtonModule],
  exports: [CoffeeWizardComponent],
})
export class CoffeeWizardModule {}
