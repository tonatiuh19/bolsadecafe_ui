import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  faLongArrowAltLeft,
  faLongArrowAltRight,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-coffee-wizard',
  templateUrl: './coffee-wizard.component.html',
  styleUrls: ['./coffee-wizard.component.css'],
  standalone: false,
})
export class CoffeeWizardComponent {
  @Input() subsType = 0;
  @Output() cancelWizard = new EventEmitter<void>();

  planInfo = [
    { label: '250gr de café', price: 199 },
    { label: '500gr de café', price: 299 },
    { label: '1kg de café', price: 399 },
  ];
  // Default selected by id
  selectedRoast: number = 1;
  addressForm: FormGroup;
  recipientForm: FormGroup;
  submitted: boolean = false;
  activeIndex: number = 0;
  isMobile: boolean = false;

  // FontAwesome icons
  faLongArrowAltLeft = faLongArrowAltLeft;
  faLongArrowAltRight = faLongArrowAltRight;
  faTimes = faTimes;

  roastOptions = [
    {
      id_product_f_cuerpo_types: 1,
      value: 'Grano completo',
      subtitle: 'Perfecto para cafeteras de filtro',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
    {
      id_product_f_cuerpo_types: 2,
      value: 'Molido Medio',
      subtitle: 'Perfecto para cafeteras de filtro',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
    {
      id_product_f_cuerpo_types: 3,
      value: 'Molido Extra Fino',
      subtitle: 'Perfecto para cafeteras de filtro',
      image_radio:
        'https://garbrix.com/bolsadecafe/assets/images/coffee-machine-svgrepo-com.svg',
    },
  ];

  constructor(private fb: FormBuilder, private renderer: Renderer2) {
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      extNumber: ['', Validators.required],
      intNumber: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
    });
    // ...existing code...

    this.recipientForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
    });

    this.checkIfMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.renderer.addClass(document.body, 'mobile');
    } else {
      this.renderer.removeClass(document.body, 'mobile');
    }
  }

  selectRoast(roastId: number) {
    this.selectedRoast = roastId;
  }

  get selectedRoastOption() {
    return this.roastOptions.find(
      (o) => o.id_product_f_cuerpo_types === this.selectedRoast
    );
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

  cancelStep() {
    this.cancelWizard.emit(); // Notify parent
    this.activeIndex = 0;
    this.selectedRoast = 1;
    this.addressForm.reset();
    this.recipientForm.reset();
    this.submitted = false;
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

    console.log({
      roast: this.selectedRoastOption,
      address: this.addressForm.value,
      recipient: this.recipientForm.value,
    });
  }
}
