import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { fromLanding } from '../../store/selectors';
import { WizardModel } from '../../store/states/landing.models';
import { Router } from '@angular/router';
import { LandingActions } from '../../store/actions';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.css'],
  standalone: false,
})
export class SuccessPageComponent implements OnInit, OnDestroy {
  planInfo: any;
  roast: any;
  address: any;
  recipient: any;

  private unsubscribe$ = new Subject<void>();

  private planInfoArray = [
    { label: '250gr de café', price: 199 },
    { label: '500gr de café', price: 299 },
    { label: '1kg de café', price: 399 },
  ];

  constructor(private store: Store, private router: Router) {}

  ngOnInit() {
    this.store
      .select(fromLanding.selectWizard)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((wizard: WizardModel) => {
        console.log('Wizard data:', wizard);
        if (wizard) {
          this.planInfo = this.planInfoArray[wizard.subsType - 1] || null;
          this.roast = wizard.roast;
          this.address = wizard.address;
          this.recipient = wizard.recipient;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goToSubscriptionPanel() {
    this.store.dispatch(LandingActions.cleanWizard());
    this.router.navigate(['suscribete']);
  }
}
