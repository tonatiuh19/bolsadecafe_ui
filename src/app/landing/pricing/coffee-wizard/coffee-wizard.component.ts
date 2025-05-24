import {
  AfterViewChecked,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  faLongArrowAltLeft,
  faLongArrowAltRight,
  faTimes,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  UserModel,
  WizardModel,
} from '../../../shared/store/states/landing.models';
import { Store } from '@ngrx/store';
import { LandingActions } from '../../../shared/store/actions';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-coffee-wizard',
  templateUrl: './coffee-wizard.component.html',
  styleUrls: ['./coffee-wizard.component.css'],
  standalone: false,
})
export class CoffeeWizardComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @Input() subsType = 0;
  @Input() wizard!: WizardModel;
  @Input() user!: UserModel;
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
  faUserCircle = faUserCircle;

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

  private firstRender = true;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private store: Store,
    private router: Router,
    private titleService: Title,
    public auth: AuthService
  ) {
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      extNumber: ['', Validators.required],
      intNumber: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
    });

    this.recipientForm = this.fb.group({
      name: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/), // 10 digits only
        ],
      ],
    });

    this.checkIfMobile();
  }

  ngOnInit() {
    if (this.wizard) {
      if (this.wizard.roast.id_product_f_cuerpo_types) {
        this.selectRoast(this.wizard.roast.id_product_f_cuerpo_types);
        this.selectedRoast = this.wizard.roast.id_product_f_cuerpo_types;
      }
      if (this.wizard.address.address) {
        this.addressForm.patchValue({
          address: this.wizard.address.address,
          extNumber: this.wizard.address.extNumber,
          intNumber: this.wizard.address.intNumber,
          city: this.wizard.address.city,
          state: this.wizard.address.state,
          zip: this.wizard.address.zip,
        });
      }
      if (this.user.name) {
        this.recipientForm.patchValue({
          name: this.user.last_name
            ? `${this.user.name} ${this.user.last_name}`
            : this.user.name,
        });
      }

      if (this.wizard.wizardStep === 2) {
        this.activeIndex = 1; // Go to step 2
      } else if (this.wizard.wizardStep === 3) {
        this.activeIndex = 2; // Go to step 3
      } else if (this.wizard.wizardStep === 4) {
        this.activeIndex = 3; // Go to step 4
      } else {
        this.activeIndex = 0; // Default to step 1
      }
    }

    this.applyBodyStyles();
  }

  ngOnDestroy() {
    this.removeBodyStyles();
  }

  ngAfterViewChecked() {
    if (this.firstRender) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.firstRender = false;
    }

    this.applyBodyStyles();
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
    if (this.activeIndex === 1) {
      this.store.dispatch(
        LandingActions.setRoast({
          roast: {
            id_product_f_cuerpo_types: this.selectedRoast,
            value: this.selectedRoastOption?.value ?? '',
            subtitle: this.selectedRoastOption?.subtitle ?? '',
            image_radio: this.selectedRoastOption?.image_radio ?? '',
          },
          subsType: this.subsType,
        })
      );
    } else if (this.activeIndex === 2) {
      this.store.dispatch(
        LandingActions.setAddress({
          address: {
            address: this.addressForm.value.address,
            extNumber: this.addressForm.value.extNumber,
            intNumber: this.addressForm.value.intNumber,
            city: this.addressForm.value.city,
            state: this.addressForm.value.state,
            zip: this.addressForm.value.zip,
          },
          subsType: this.subsType,
        })
      );
    } else if (this.activeIndex === 3) {
      this.store.dispatch(
        LandingActions.setRecipient({
          recipient: {
            name: this.recipientForm.value.name,
            phone: this.recipientForm.value.phone,
          },
          subsType: this.subsType,
        })
      );
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(activateCallback: (index: number) => void, index: number) {
    this.activeIndex = index;
    activateCallback(index);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelStep() {
    this.cancelWizard.emit(); // Notify parent
    this.activeIndex = 0;
    this.selectedRoast = 1;
    this.addressForm.reset();
    this.recipientForm.reset();
    this.submitted = false;
    this.firstRender = true;
    this.store.dispatch(LandingActions.cleanWizard());
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

  login(): void {
    const urlSegment = this.router.url.split('/').slice(1).join('/');
    /*this.store.dispatch(
      LandingActions.setWizardStep({ subsType: this.subsType })
    );*/
    this.auth.loginWithRedirect({
      appState: { target: urlSegment },
    });
  }

  private applyBodyStyles() {
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');
    this.renderer.setStyle(document.body, 'max-width', '100vw');
  }

  private removeBodyStyles() {
    this.renderer.removeStyle(document.body, 'overflow-x');
    this.renderer.removeStyle(document.body, 'max-width');
  }
}
