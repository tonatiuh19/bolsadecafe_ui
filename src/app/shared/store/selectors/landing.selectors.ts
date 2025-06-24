import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LANDING_FEATURE_KEY } from '../states/landing.state';
import { LandingState } from '../states/landing.models';

export const selectLandingState =
  createFeatureSelector<LandingState>(LANDING_FEATURE_KEY);

export const selectUser = createSelector(
  selectLandingState,
  (state: LandingState) => state.user
);

export const selecIsloading = createSelector(
  selectLandingState,
  (state: LandingState) => state.isLoading
);

export const selectWizard = createSelector(
  selectLandingState,
  (state: LandingState) => state.wizard
);

export const selectSubscription = createSelector(
  selectUser,
  (user) => user.subscription
);

export const selectRoastTypes = createSelector(
  selectLandingState,
  (state: LandingState) => state.roastTypes
);
