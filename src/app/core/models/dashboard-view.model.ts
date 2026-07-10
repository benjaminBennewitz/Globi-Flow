/* src/app/core/models/dashboard-view.model.ts */

/**
 * @file Bündelt die Daten für die aktuelle Frontend-Startansicht.
 * @module DashboardViewModel
 */

import { DashboardTrend, Laborwert, LaborwertGruppe } from './laborwert.model';
import { Importjob } from './importjob.model';
import { Patientenbericht } from './patientenbericht.model';
import { ReviewEintrag } from './review-eintrag.model';
import { Wissenseintrag } from './wissenseintrag.model';

/** Kompakte Kennzahlen für Navigation und Startbereich. */
export interface DashboardKennzahlen {
  befunde: number;     // Anzahl hochgeladener oder vorbereiteter Befunde.
  laborwerte: number;  // Anzahl erkannter Laborwerte.
  review: number;      // Anzahl Review-Punkte.
  berichte: number;    // Anzahl freigegebener Berichte.
  confidence: number;  // Durchschnittliche Erkennungssicherheit.
}

/** Zentrales ViewModel der Mock-Startansicht. */
export interface DashboardViewModel {
  kennzahlen: DashboardKennzahlen;     // Globale Kennzahlen.
  importjobs: Importjob[];             // Importjobs für Upload- und Statusbereich.
  laborwerte: Laborwert[];             // Normalisierte Laborwerte für das Dashboard.
  gruppen: LaborwertGruppe[];          // Gruppierte Laborwert-Auswertung.
  trends: DashboardTrend[];            // Trenddaten für große Grafiken.
  reviewEintraege: ReviewEintrag[];    // Unsichere Werte für die Review-Oberfläche.
  wissenseintraege: Wissenseintrag[];  // Wissensinhalte für Editor und Berichtsvorschau.
  patientenbericht: Patientenbericht;  // Vorschau eines freigegebenen Patientenberichts.
}
