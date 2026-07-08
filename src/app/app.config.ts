/* src/app/app.config.ts */

/**
 * @file Enthält die globale Angular-Konfiguration.
 * @module appConfig
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/** Globale App-Konfiguration mit Router, HttpClient und stabiler Zone-Change-Detection. */
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(), provideRouter(routes)]
};
