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
  /** Anzahl hochgeladener oder vorbereiteter Befunde. */
  befunde: number;

  /** Anzahl erkannter Laborwerte. */
  laborwerte: number;

  /** Anzahl Review-Punkte. */
  review: number;

  /** Anzahl freigegebener Berichte. */
  berichte: number;

  /** Durchschnittliche Erkennungssicherheit. */
  confidence: number;
}

/** Zentrales ViewModel der Mock-Startansicht. */
export interface DashboardViewModel {
  /** Globale Kennzahlen. */
  kennzahlen: DashboardKennzahlen;

  /** Importjobs für Upload- und Statusbereich. */
  importjobs: Importjob[];

  /** Normalisierte Laborwerte für das Dashboard. */
  laborwerte: Laborwert[];

  /** Gruppierte Laborwert-Auswertung. */
  gruppen: LaborwertGruppe[];

  /** Trenddaten für große Grafiken. */
  trends: DashboardTrend[];

  /** Unsichere Werte für die Review-Oberfläche. */
  reviewEintraege: ReviewEintrag[];

  /** Wissensinhalte für Editor und Berichtsvorschau. */
  wissenseintraege: Wissenseintrag[];

  /** Vorschau eines freigegebenen Patientenberichts. */
  patientenbericht: Patientenbericht;
}
