import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingState } from '../../../shared/store/states/landing.models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pricing-cards',
  standalone: false,
  templateUrl: './pricing-cards.component.html',
  styleUrl: './pricing-cards.component.css',
})
export class PricingCardsComponent implements OnInit, OnDestroy {
  @Input() isMain = false;
  @Output() openWizard = new EventEmitter<number>();

  public selectLandingState$ = this.store.select(
    fromLanding.selectLandingState
  );

  faCheck = faCheck;

  hasSubscription = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectLandingState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state: LandingState) => {
        this.hasSubscription = state.user.has_subscription ?? false;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.removeBodyStyles();
  }

  goToSuscribtionPage(type: number) {
    if (!this.isMain) {
      this.openWizard.emit(type);
      return;
    } else {
      this.router.navigate(['/suscribete'], { queryParams: { type } });
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
