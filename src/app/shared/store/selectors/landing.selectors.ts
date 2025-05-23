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
