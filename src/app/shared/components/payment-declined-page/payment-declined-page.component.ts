import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { LandingActions } from '../../store/actions';

@Component({
  selector: 'app-payment-declined-page',
  templateUrl: './payment-declined-page.component.html',
  styleUrls: ['./payment-declined-page.component.css'],
  standalone: false,
})
export class PaymentDeclinedPageComponent {
  faTimesCircle = faTimesCircle;

  constructor(private store: Store, private router: Router) {}

  retry(): void {
    this.store.dispatch(LandingActions.cleanPayment());
    this.router.navigate(['suscribete']);
  }
}
