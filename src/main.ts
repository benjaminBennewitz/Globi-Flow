/* src/main.ts */

/**
 * @file Startet die Angular-App für Daten Dashboards.
 * @module main
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((fehler: unknown) => console.error(fehler));
