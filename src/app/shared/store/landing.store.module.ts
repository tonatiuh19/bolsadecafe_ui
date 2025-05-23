import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LANDING_FEATURE_KEY } from './states/landing.state';
import { LandingReducer } from './reducers/landing.reducer';
import { LandingEffects } from './effects/landing.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(LANDING_FEATURE_KEY, LandingReducer),
    EffectsModule.forFeature([LandingEffects]),
  ],
})
export class LandingStoreModule {}
