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
  /** Kurzes Datumslabel für die Achse. */
  label: string;

  /** ISO-Datum oder späterer API-Zeitstempel. */
  datum: string;

  /** Messwert zum Zeitpunkt. */
  wert: number;
}

/** Laborwert für Priorisierung, Detailansicht und Verlauf. */
export interface AuswertungLaborwert {
  /** Eindeutige ID des Werts. */
  id: string;

  /** Stabiler fachlicher Laborwert-Key. */
  key: string;

  /** Anzeigename des Laborwerts. */
  name: string;

  /** Fachliche Wertgruppe. */
  gruppe: string;

  /** Aktueller Messwert. */
  wert: number;

  /** Vorheriger Messwert. */
  vorherigerWert: number;

  /** Einheit des Messwerts. */
  einheit: string;

  /** Untere Referenzgrenze. */
  referenzMin: number;

  /** Obere Referenzgrenze. */
  referenzMax: number;

  /** Medizinischer Status im Verhältnis zum Referenzbereich. */
  status: LaborwertStatus;

  /** Fachliche Priorität für die Sortierung. */
  prioritaet: LaborwertPrioritaet;

  /** Review-Status des Werts. */
  reviewStatus: AuswertungReviewStatus;

  /** Erkennungssicherheit in Prozent. */
  confidence: number;

  /** Veränderung zum vorherigen Befund. */
  veraenderungAbsolut: number;

  /** Prozentuale Veränderung zum vorherigen Befund. */
  veraenderungProzent: number;

  /** Abweichung vom passenden Referenzlimit in Prozent. */
  abweichungProzent: number;

  /** Trendrichtung zum vorherigen Befund. */
  trend: AuswertungTrend;

  /** Kurzer fachlicher Hinweis ohne Diagnose. */
  hinweis: string;

  /** Verlauf über mehrere Befunde. */
  verlauf: AuswertungVerlaufspunkt[];
}

/** Gruppierte Statusmatrix einer Laborwertgruppe. */
export interface AuswertungGruppe {
  /** Eindeutiger Gruppenschlüssel. */
  key: string;

  /** Anzeigename der Gruppe. */
  name: string;

  /** Anzahl normaler Werte. */
  normal: number;

  /** Anzahl erniedrigter Werte. */
  niedrig: number;

  /** Anzahl erhöhter Werte. */
  hoch: number;

  /** Anzahl prüfpflichtiger Werte. */
  review: number;
}

/** Patient oder Testperson für die Auswertungsfilterung. */
export interface AuswertungPatient {
  /** Eindeutige Patient-ID. */
  id: string;

  /** Anzeigename der Testperson. */
  name: string;

  /** Kurzer Zusatz für Kontext oder Demo-Hinweis. */
  kontext: string;

  /** Anzahl verfügbarer Befunde. */
  befunde: number;

  /** Import-/Datenquelle für Filterung. */
  quelle: 'demo' | 'verlauf' | 'ocr' | 'manuell';
}

/** Kompakte KPI der Auswertungsroute. */
export interface AuswertungKennzahl {
  /** Anzeigename der Kennzahl. */
  label: string;

  /** Anzeigenwert der Kennzahl. */
  wert: string | number;

  /** Kurzer Kontext. */
  hinweis: string;

  /** Material-Symbol. */
  icon: string;

  /** Optionale Statusklasse. */
  status?: string;
}

/** Vollständiges ViewModel der Auswertung. */
export interface AuswertungViewModel {
  /** Verfügbare Patienten oder Testpersonen. */
  patienten: AuswertungPatient[];

  /** Angezeigte Testperson. */
  testperson: string;

  /** Aktueller Befund. */
  aktuellerBefund: string;

  /** Vergleichsbefund. */
  vergleichsBefund: string;

  /** Zeitraum der Auswertung. */
  zeitraum: string;

  /** Auswertbare Laborwerte. */
  werte: AuswertungLaborwert[];

  /** Gruppierte Statusmatrix. */
  gruppen: AuswertungGruppe[];
}
