/* src/app/core/models/auswertung.model.ts */

/**
 * @file Beschreibt die fachliche Auswertung normalisierter Laborwerte.
 * @module AuswertungModel
 */

import { LaborwertPrioritaet, LaborwertStatus } from './laborwert.model';

/** Status der ärztlichen Prüfung eines Auswertungswerts. */
export type AuswertungReviewStatus = 'geprueft' | 'review';

/** Trendrichtung im Vergleich zum vorherigen Befund. */
export type AuswertungTrend = 'steigend' | 'fallend' | 'stabil';

/** Einzelner Verlaufspunkt eines Laborwerts. */
export interface AuswertungVerlaufspunkt {
  label: string;  // Kurzes Datumslabel für die Achse.
  datum: string;  // ISO-Datum oder späterer API-Zeitstempel.
  wert: number;   // Messwert zum Zeitpunkt.
}

/** Laborwert für Priorisierung, Detailansicht und Verlauf. */
export interface AuswertungLaborwert {
  id: string;  // Eindeutige ID des Werts.

  key: string;    // Stabiler fachlicher Laborwert-Key.
  name: string;   // Anzeigename des Laborwerts.

  gruppe: string;                        // Fachliche Wertgruppe.
  wert: number;                          // Aktueller Messwert.
  vorherigerWert: number;                // Vorheriger Messwert.
  hatVergleich?: boolean;                // Gibt an, ob für diesen Wert ein echter Vorbefund existiert.
  einheit: string;                       // Einheit des Messwerts.
  referenzMin: number;                   // Untere Referenzgrenze.
  referenzMax: number;                   // Obere Referenzgrenze.
  status: LaborwertStatus;               // Medizinischer Status im Verhältnis zum Referenzbereich.
  farbe: string;                         // Stabile Diagrammfarbe aus der Wissensbasis.
  prioritaet: LaborwertPrioritaet;       // Fachliche Priorität für die Sortierung.
  reviewStatus: AuswertungReviewStatus;  // Review-Status des Werts.
  confidence: number;                    // Erkennungssicherheit in Prozent.
  veraenderungAbsolut: number;           // Veränderung zum vorherigen Befund.
  veraenderungProzent: number;           // Prozentuale Veränderung zum vorherigen Befund.
  abweichungProzent: number;             // Abweichung vom passenden Referenzlimit in Prozent.
  trend: AuswertungTrend;                // Trendrichtung zum vorherigen Befund.
  hinweis: string;                       // Kurzer fachlicher Hinweis ohne Diagnose.
  verlauf: AuswertungVerlaufspunkt[];    // Verlauf über mehrere Befunde.
}

/** Gruppierte Statusmatrix einer Laborwertgruppe. */
export interface AuswertungGruppe {
  key: string;      // Eindeutiger Gruppenschlüssel.
  name: string;     // Anzeigename der Gruppe.
  normal: number;   // Anzahl normaler Werte.
  niedrig: number;  // Anzahl erniedrigter Werte.
  hoch: number;     // Anzahl erhöhter Werte.
  review: number;   // Anzahl prüfpflichtiger Werte.
}

/** Kompakte KPI der Auswertungsroute. */
export interface AuswertungKennzahl {
  label: string;          // Anzeigename der Kennzahl.
  wert: string | number;  // Anzeigenwert der Kennzahl.
  hinweis: string;        // Kurzer Kontext.
  beschreibung?: string;  // Transparente Erklärung der Berechnungslogik.
  icon: string;           // Material-Symbol.
  status?: string;        // Optionale Statusklasse.
}

/** Vollständiges ViewModel der Auswertung. */
export interface AuswertungViewModel {
  aktuellerBefund: string;       // Aktueller Befund.
  vergleichsBefund: string;      // Vergleichsbefund.
  hatVergleich?: boolean;        // Gibt an, ob ein echter Vergleichsbefund existiert.
  zeitraum: string;              // Zeitraum der Auswertung.
  werte: AuswertungLaborwert[];  // Auswertbare Laborwerte.
  gruppen: AuswertungGruppe[];   // Gruppierte Statusmatrix.
}
