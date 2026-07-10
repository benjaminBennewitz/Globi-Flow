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
  id: string;                       // Eindeutige Wert-ID.
  key: string;                      // Stabiler fachlicher Schlüssel für Wissensdatenbank und API.
  name: string;                     // Lesbarer Anzeigename.
  gruppe: string;                   // Medizinische Gruppe im Dashboard.
  wert: number;                     // Normalisierter Zahlenwert.
  einheit: string;                  // Einheit des Laborwerts.
  referenzMin: number;              // Untere Grenze des Referenzbereichs.
  referenzMax: number;              // Obere Grenze des Referenzbereichs.
  status: LaborwertStatus;          // Status im Verhältnis zum Referenzbereich.
  prioritaet: LaborwertPrioritaet;  // Priorität für Anzeige und Review.
  confidence: number;               // Erkennungssicherheit in Prozent.
  trend: number[];                  // Verlaufspunkte für kompakte Liniengrafiken.
  hinweis: string;                  // Kurzer automatischer Hinweis für die Oberfläche.
}

/** Gruppierte Dashboard-Auswertung. */
export interface LaborwertGruppe {
  key: string;         // Eindeutiger Gruppenschlüssel.
  name: string;        // Anzeigename der Gruppe.
  normal: number;      // Anzahl normaler Werte.
  auffaellig: number;  // Anzahl auffälliger Werte.
  review: number;      // Anzahl Werte im Review.
}

/** Trendserie für große Dashboard-Grafiken. */
export interface DashboardTrend {
  key: string;          // Eindeutiger Trend-Schlüssel.
  name: string;         // Anzeigename der Serie.
  einheit: string;      // Einheit der Serie.
  werte: number[];      // Verlaufspunkte der Serie.
  referenzMin: number;  // Untere Grenze des Referenzbereichs.
  referenzMax: number;  // Obere Grenze des Referenzbereichs.
}
