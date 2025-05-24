import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { LandingActions } from '../actions';
import { LandingService } from '../../services/landing.service';
import { fromLanding } from '../selectors';

@Injectable()
export class LandingEffects {
  authenticateUser$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LandingActions.authenticateUser),
        withLatestFrom(
          this.store.select(
            fromLanding.selectLandingState,
            fromLanding.selectUser
          )
        ),
        switchMap(([landingEntity, landingUser]) => {
          /*return of(1);*/
          return this.landingService
            .authenticateUser(
              landingEntity.user.email,
              landingEntity.user.email_verified,
              landingEntity.user.given_name ?? '',
              landingEntity.user.family_name ?? '',
              landingEntity.user.picture,
              0
            )
            .pipe(
              map((response) => {
                if (response) {
                  return LandingActions.authenticateUserSuccess({
                    user: response,
                  });
                } else {
                  return LandingActions.authenticateUserFailure({
                    errorResponse: 'Invalid credentials',
                  });
                }
              }),
              catchError((error) => {
                return of(
                  LandingActions.authenticateUserFailure({
                    errorResponse: error,
                  })
                );
              })
            );
        })
      );
    }
    //{ dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private landingService: LandingService
  ) {}
}
