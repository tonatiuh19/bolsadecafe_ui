import {
  AfterViewChecked,
  ChangeDetectorRef,
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
  faMugHot,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import {
  RoastModel,
  UserModel,
  WizardModel,
} from '../../../shared/store/states/landing.models';
import { Store } from '@ngrx/store';
import { LandingActions } from '../../../shared/store/actions';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@auth0/auth0-angular';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { StripeService } from '../../../shared/services/stripe.service';
import { fromLanding } from '../../../shared/store/selectors';
import { Subject, take, takeUntil } from 'rxjs';

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

  public selectRoastTypes$ = this.store.select(fromLanding.selectRoastTypes);

  planInfo = [
    { label: '250gr de café', price: 199 },
    { label: '500gr de café', price: 299 },
    { label: '1kg de café', price: 399 },
  ];

  coffeeTypes!: RoastModel[];

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
  faMugHot = faMugHot;
  faLock = faLock;

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

  public isProcessingPayment = false;
  public isLoadingCheckout = false;
  public isStripeError = false;
  public stripeErrorMessage = '';

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  private isTesting = true; // Set to true for testing, false for production

  private firstRender = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private store: Store,
    private router: Router,
    private titleService: Title,
    public auth: AuthService,
    private stripeService: StripeService,
    private cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      extNumber: ['', Validators.required],
      intNumber: [''],
      city: ['', Validators.required],
      reference: ['', Validators.required],
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
    this.isProcessingPayment = false;

    this.selectRoastTypes$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((roastTypes: RoastModel[]) => {
        this.coffeeTypes = roastTypes;
        this.cdr.detectChanges();
      });

    if (this.wizard) {
      if (this.wizard.roast.id) {
        this.selectRoast(this.wizard.roast.id);
        this.selectedRoast = this.wizard.roast.id;
      }
      if (this.wizard.address.address) {
        this.addressForm.patchValue({
          address: this.wizard.address.address,
          extNumber: this.wizard.address.extNumber,
          intNumber: this.wizard.address.intNumber,
          reference: this.wizard.address.reference,
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
        this.activeIndex = 2; // Go to step 3
      } else {
        this.activeIndex = 0; // Default to step 1
      }
    }

    this.applyBodyStyles();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.removeBodyStyles();
  }

  ngAfterViewChecked() {
    if (this.firstRender) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.firstRender = false;
    }

    this.applyBodyStyles();
  }

  async setupStripe() {
    const style = {
      base: {
        color: '#32325d',
        fontSmoothing: 'antialiased',
        fontSize: '18px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#dc3545',
        iconColor: '#dc3545',
      },
    };
    this.stripe = await this.stripeService.getStripe(this.isTesting);
    if (this.stripe) {
      this.elements = this.stripe.elements({
        locale: 'es',
      });
      this.card = this.elements.create('card', { style });
      this.card.mount('#card-element');
    }
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
    return this.coffeeTypes.find((o) => o.id === this.selectedRoast);
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

    if (this.activeIndex === 3) {
      this.waitForCardElementAndSetupStripe();
    }

    if (this.activeIndex === 1) {
      this.store.dispatch(
        LandingActions.setRoast({
          roast: {
            id: this.selectedRoast,
            value: this.selectedRoastOption?.value ?? '',
            machine: this.selectedRoastOption?.machine ?? '',
            svg: this.selectedRoastOption?.svg ?? '',
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
            reference: this.addressForm.value.reference,
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

  login(): void {
    const urlSegment = this.router.url.split('/').slice(1).join('/');
    /*this.store.dispatch(
      LandingActions.setWizardStep({ subsType: this.subsType })
    );*/
    this.auth.loginWithRedirect({
      appState: { target: urlSegment },
    });
  }

  async handlePayment(event: Event) {
    event.preventDefault();

    this.isLoadingCheckout = true;
    if (!this.stripe || !this.card) {
      return;
    }

    const { token, error } = await this.stripe.createToken(this.card);

    if (error) {
      this.isLoadingCheckout = false;
      this.isStripeError = true;
      this.stripeErrorMessage = error.message || '';
    } else {
      this.isProcessingPayment = true;
      const paymentMethodResult = await this.stripe.createPaymentMethod({
        type: 'card',
        card: { token: token.id },
      });

      if (paymentMethodResult.error) {
        this.isLoadingCheckout = false;
        this.isStripeError = true;
        this.stripeErrorMessage = paymentMethodResult.error.message || '';
        return;
      }

      this.isLoadingCheckout = true;
      this.isStripeError = false;
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

      this.store.dispatch(
        LandingActions.attachPaymentMethod({
          paymentMethodId: paymentMethodResult.paymentMethod.id,
          customerId: this.user.stripe_id,
        })
      );
    }
  }

  private waitForCardElementAndSetupStripe(retries = 10) {
    const el = document.getElementById('card-element');
    if (el) {
      this.setupStripe();
    } else if (retries > 0) {
      setTimeout(() => this.waitForCardElementAndSetupStripe(retries - 1), 50);
    } else {
      console.error('Stripe card element not found after waiting.');
    }
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
