import {
  AfterViewChecked,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import {
  LandingState,
  UserModel,
  WizardModel,
} from '../../shared/store/states/landing.models';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingActions } from '../../shared/store/actions';

@Component({
  selector: 'app-pricing',
  standalone: false,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent implements OnInit, OnDestroy, AfterViewChecked {
  public selectLandingState$ = this.store.select(
    fromLanding.selectLandingState
  );

  wizard!: WizardModel;
  user!: UserModel;

  isSuscribtionPage = false;
  subsType = 0;

  faCheck = faCheck;

  hasSubscription = false;

  private lastSuscribtionPage = false;

  private manualSubscriptionPage = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'] ? +params['type'] : 0;
      if (type !== 0) {
        this.subsType = type;
        this.isSuscribtionPage = true;
        this.manualSubscriptionPage = true;

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      } else {
        this.manualSubscriptionPage = false;
      }
    });

    this.applyBodyStyles();
    this.store.dispatch(
      LandingActions.insertVisitor({
        section: 'pricing',
      })
    );

    this.selectLandingState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state: LandingState) => {
        if (!this.manualSubscriptionPage) {
          this.subsType = state.wizard.subsType;
          this.isSuscribtionPage = this.subsType !== 0;
        }
        this.wizard = state.wizard;
        this.user = state.user;

        this.hasSubscription = this.user.has_subscription ?? false;

        if (this.wizard.isPaid) {
          this.router.navigate(['subscripcion-exitosa']);
        }

        if (this.wizard.isInvalidPayment) {
          this.router.navigate(['pago-declinado']);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.removeBodyStyles();
  }

  goToSuscribtionPage(type: number) {
    this.subsType = type;
    this.isSuscribtionPage = true;
  }

  ngAfterViewChecked() {
    if (this.isSuscribtionPage !== this.lastSuscribtionPage) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.lastSuscribtionPage = this.isSuscribtionPage;
    }
    // Always apply styles when showing pricing
    if (!this.isSuscribtionPage) {
      this.applyBodyStyles();
    }
  }

  goToMySubscription() {
    this.router.navigate(['mi-suscripcion']);
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
