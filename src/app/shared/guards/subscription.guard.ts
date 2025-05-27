// filepath: /Users/felixgomez/Code/bolsadecafe_ui/src/app/shared/guards/subscription.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { fromLanding } from '../store/selectors';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select(fromLanding.selectLandingState).pipe(
      take(1),
      map((state) => {
        const user = state.user;
        if (user && user.isLoggedIn && user.has_subscription) {
          return true;
        }
        this.router.navigate(['/suscribete']);
        return false;
      })
    );
  }
}
