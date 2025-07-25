import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoffeeWizardComponent } from './coffee-wizard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CoffeeWizardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepperModule,
    ButtonModule,
    FontAwesomeModule,
    FormsModule,
  ],
  exports: [CoffeeWizardComponent],
})
export class CoffeeWizardModule {}
