import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromLanding } from '../store/selectors';
import { map, take } from 'rxjs/operators';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(fromLanding.selectLandingState).pipe(
    take(1),
    map((landingState) => {
      if (landingState.user && landingState.user.isLoggedIn) {
        return true;
      }
      router.navigate(['']);
      return false;
    })
  );
};
