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

  attachPaymentMethod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LandingActions.attachPaymentMethod),
      switchMap(({ paymentMethodId, customerId }) =>
        this.landingService
          .attachPaymentMethodToCustomer(paymentMethodId, customerId)
          .pipe(
            map((response) =>
              LandingActions.attachPaymentMethodSuccess({ response })
            ),
            catchError((error) =>
              of(LandingActions.attachPaymentMethodFailure({ error }))
            )
          )
      )
    )
  );

  subscribeAfterAttach$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LandingActions.attachPaymentMethodSuccess),
      withLatestFrom(this.store.select(fromLanding.selectLandingState)),
      switchMap(([action, state]) => {
        return this.landingService
          .subscribeCustomerToPlan(
            state.user.stripe_id,
            String(state.wizard.subsType),
            state.user.id,
            state.wizard.roast,
            state.wizard.address,
            state.wizard.recipient
          )
          .pipe(
            map((response) =>
              LandingActions.subscribeCustomerSuccess({ response })
            ),
            catchError((error) =>
              of(LandingActions.subscribeCustomerFailure({ error }))
            )
          );
      })
    )
  );

  retriveCustomerSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LandingActions.retrieveSubscription),
      switchMap(({ stripe_subscription_id }) =>
        this.landingService
          .retrieveSubscriptionById(stripe_subscription_id)
          .pipe(
            map((response) =>
              LandingActions.retrieveSubscriptionSuccess({ response })
            ),
            catchError((error) =>
              of(LandingActions.retrieveSubscriptionFailure({ error }))
            )
          )
      )
    )
  );

  insertVisitor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LandingActions.insertVisitor),
      switchMap(({ section }) =>
        this.landingService.insertVisitor(section).pipe(
          map((response) => LandingActions.insertVisitorSuccess({ response })),
          catchError((error) =>
            of(LandingActions.insertVisitorFailure({ error }))
          )
        )
      )
    )
  );

  //TODO: Remove this when ux is ready
  deleteUserAndSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LandingActions.deleteUserAndSubscription),
      switchMap(({ user_id }) =>
        this.landingService.deleteUserAndSubscription(user_id).pipe(
          map((response) =>
            LandingActions.deleteUserAndSubscriptionSuccess({ response })
          ),
          catchError((error) =>
            of(LandingActions.deleteUserAndSubscriptionFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private landingService: LandingService
  ) {}
}
