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

  private lastSuscribtionPage = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private renderer: Renderer2, private store: Store) {}

  ngOnInit() {
    this.applyBodyStyles();

    this.selectLandingState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state: LandingState) => {
        this.subsType = state.wizard.subsType;
        this.isSuscribtionPage = this.subsType !== 0;
        this.wizard = state.wizard;
        this.user = state.user;
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

  private applyBodyStyles() {
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');
    this.renderer.setStyle(document.body, 'max-width', '100vw');
  }

  private removeBodyStyles() {
    this.renderer.removeStyle(document.body, 'overflow-x');
    this.renderer.removeStyle(document.body, 'max-width');
  }
}
