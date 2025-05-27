import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingModule } from './landing/landing.module';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { StoreModule as NgrxStoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import Aura from '@primeng/themes/aura';
import { LoadingMaskModule } from './shared/components/loading-mask/loading-mask.module';
import { SuccessPageModule } from './shared/components/success-page/success-page.module';
import { PaymentDeclinedPageModule } from './shared/components/payment-declined-page/payment-declined-page.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LandingModule,
    SuccessPageModule,
    PaymentDeclinedPageModule,
    BrowserAnimationsModule,
    EffectsModule.forRoot([]),
    NgrxStoreModule.forRoot({
      routerReducer: routerReducer,
    }),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
    LoadingMaskModule,
  ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
