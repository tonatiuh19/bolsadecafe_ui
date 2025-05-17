import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoffeeWizardComponent } from './coffee-wizard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [CoffeeWizardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepperModule,
    ButtonModule,
    FontAwesomeModule,
  ],
  exports: [CoffeeWizardComponent],
})
export class CoffeeWizardModule {}
