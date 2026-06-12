/* src/app/core/models/laborwert.model.ts */

/**
 * @file Beschreibt normalisierte Laborwerte und Dashboard-Daten.
 * @module LaborwertModel
 */

/** Medizinischer Darstellungsstatus eines Laborwerts. */
export type LaborwertStatus = 'normal' | 'hoch' | 'niedrig' | 'review';

/** Priorität für Dashboard und ärztliche Prüfung. */
export type LaborwertPrioritaet = 'niedrig' | 'mittel' | 'hoch';

/** Normalisierter Laborwert aus Befund oder Mockdaten. */
export interface Laborwert {
  /** Eindeutige Wert-ID. */
  id: string;

  /** Stabiler fachlicher Schlüssel für Wissensdatenbank und API. */
  key: string;

  /** Lesbarer Anzeigename. */
  name: string;

  /** Medizinische Gruppe im Dashboard. */
  gruppe: string;

  /** Normalisierter Zahlenwert. */
  wert: number;

  /** Einheit des Laborwerts. */
  einheit: string;

  /** Untere Grenze des Referenzbereichs. */
  referenzMin: number;

  /** Obere Grenze des Referenzbereichs. */
  referenzMax: number;

  /** Status im Verhältnis zum Referenzbereich. */
  status: LaborwertStatus;

  /** Priorität für Anzeige und Review. */
  prioritaet: LaborwertPrioritaet;

  /** Erkennungssicherheit in Prozent. */
  confidence: number;

  /** Verlaufspunkte für kompakte Liniengrafiken. */
  trend: number[];

  /** Kurzer automatischer Hinweis für die Oberfläche. */
  hinweis: string;
}

/** Gruppierte Dashboard-Auswertung. */
export interface LaborwertGruppe {
  /** Eindeutiger Gruppenschlüssel. */
  key: string;

  /** Anzeigename der Gruppe. */
  name: string;

  /** Anzahl normaler Werte. */
  normal: number;

  /** Anzahl auffälliger Werte. */
  auffaellig: number;

  /** Anzahl Werte im Review. */
  review: number;
}

/** Trendserie für große Dashboard-Grafiken. */
export interface DashboardTrend {
  /** Eindeutiger Trend-Schlüssel. */
  key: string;

  /** Anzeigename der Serie. */
  name: string;

  /** Einheit der Serie. */
  einheit: string;

  /** Verlaufspunkte der Serie. */
  werte: number[];

  /** Untere Grenze des Referenzbereichs. */
  referenzMin: number;

  /** Obere Grenze des Referenzbereichs. */
  referenzMax: number;
}
