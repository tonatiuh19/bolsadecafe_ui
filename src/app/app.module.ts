import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingModule } from './landing/landing.module';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LandingModule,
    BrowserAnimationsModule,
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
