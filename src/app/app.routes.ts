/* src/app/app.routes.ts */

/**
 * @file Definiert alle Hauptrouten der Daten-Dashboards-App.
 * @module AppRoutes
 */

import { Routes } from '@angular/router';
import { AnalysePageComponent } from './pages/analyse-page/analyse-page.component';
import { BerichtePageComponent } from './pages/berichte-page/berichte-page.component';
import { ImportePageComponent } from './pages/importe-page/importe-page.component';
import { ReviewPageComponent } from './pages/review-page/review-page.component';
import { UebersichtPageComponent } from './pages/uebersicht-page/uebersicht-page.component';
import { WissensbasisPageComponent } from './pages/wissensbasis-page/wissensbasis-page.component';

/** Hauptrouten mit eigener Seite pro Sidebar-Punkt. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'uebersicht' },
  { path: 'uebersicht', component: UebersichtPageComponent },
  { path: 'übersicht', redirectTo: 'uebersicht' },
  { path: 'importe', component: ImportePageComponent },
  { path: 'auswertung', component: AnalysePageComponent },
  { path: 'review', component: ReviewPageComponent },
  { path: 'wissensbasis', component: WissensbasisPageComponent },
  { path: 'berichte', component: BerichtePageComponent },
  { path: '**', redirectTo: 'uebersicht' }
];
