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
      'pk_test_51RN3Fk04sI0kP0GK83J15kGLwxySZbhrQCuBGsodXrBKzXn2w3bn3HyEUBqDdsm4kXAV0r9hWUXC5W6DS6xw8nMq00Iw1Ys830'
    );

    this.stripePromise = loadStripe(
      'pk_live_51OtL2vI0AVtzugqltvZm5ksr8GksOfhd1A7kHPrgfaQ6KVbdZsfSzO9smgpU3ayu6DyLuHL0gf41jiAkhYtjz9gZ00NLe3cI7y'
    );
  }

  async getStripe(isTesting: boolean) {
    console.log('isTesting', isTesting);
    return (await isTesting) ? this.stripePromiseTest : this.stripePromise;
  }
}
