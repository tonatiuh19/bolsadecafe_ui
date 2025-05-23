import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromiseTest: Promise<Stripe | null>;
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromiseTest = loadStripe(
      'pk_test_51OtL2vI0AVtzugqlUy24sYbVY170Lw8T6SFaQxpJYqiLRoxs90HRumG2XT9uvuu9ao3zDZ0gGbzUCbdlCoJ0qJlN00gnAE96oj'
    );

    this.stripePromise = loadStripe(
      'pk_live_51OtL2vI0AVtzugqltvZm5ksr8GksOfhd1A7kHPrgfaQ6KVbdZsfSzO9smgpU3ayu6DyLuHL0gf41jiAkhYtjz9gZ00NLe3cI7y'
    );
  }

  async getStripe(isTesting: boolean) {
    return (await isTesting) ? this.stripePromiseTest : this.stripePromise;
  }
}
