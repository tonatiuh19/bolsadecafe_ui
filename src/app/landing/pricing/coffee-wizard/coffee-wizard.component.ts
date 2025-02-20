import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-coffee-wizard',
  templateUrl: './coffee-wizard.component.html',
  styleUrls: ['./coffee-wizard.component.css'],
  standalone: false,
})
export class CoffeeWizardComponent {
  selectedRoast: string = '';
  addressForm: FormGroup;
  recipientForm: FormGroup;
  submitted: boolean = false;
  activeIndex: number = 0;

  roastOptions = [
    {
      id_product_f_cuerpo_types: 1,
      value: 'Grano completo',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
    {
      id_product_f_cuerpo_types: 2,
      value: 'Molido Medio',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
    {
      id_product_f_cuerpo_types: 3,
      value: 'Molido Extra Fino',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
    });

    this.recipientForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  selectRoast(roast: string) {
    this.selectedRoast = roast;
  }

  nextStep(activateCallback: (index: number) => void, index: number) {
    this.submitted = true;

    if (this.activeIndex === 0 && !this.selectedRoast) {
      return;
    }

    if (this.activeIndex === 1 && this.addressForm.invalid) {
      return;
    }

    if (this.activeIndex === 2 && this.recipientForm.invalid) {
      return;
    }

    this.activeIndex = index;
    this.submitted = false;
    activateCallback(index);
  }

  prevStep(activateCallback: (index: number) => void, index: number) {
    this.activeIndex = index;
    activateCallback(index);
  }

  isStepValid(step: number): boolean {
    if (step === 0) {
      return !!this.selectedRoast;
    }
    if (step === 1) {
      return this.addressForm.valid;
    }
    if (step === 2) {
      return this.recipientForm.valid;
    }
    if (step === 3) {
      return false;
    }
    return true;
  }

  onSubmit() {
    this.submitted = true;

    if (
      !this.selectedRoast ||
      this.addressForm.invalid ||
      this.recipientForm.invalid
    ) {
      return;
    }

    // Proceed to submit the form
  }
}
