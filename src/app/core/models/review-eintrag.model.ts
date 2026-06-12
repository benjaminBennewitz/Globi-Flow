/* src/app/core/models/review-eintrag.model.ts */

/**
 * @file Beschreibt ärztliche Review-Einträge für unsichere Laborwerte.
 * @module ReviewEintragModel
 */

/** Feld, das im Review geprüft oder korrigiert werden kann. */
export type ReviewFeld = 'wert' | 'einheit' | 'referenzbereich' | 'zuordnung';

/** Einzelner Review-Eintrag aus API oder Mockdaten. */
export interface ReviewEintrag {
  /** Eindeutige Review-ID. */
  id: string;

  /** Zugehöriger Laborwert-Key. */
  laborwertKey: string;

  /** Anzeigename des Laborwerts. */
  laborwertName: string;

  /** Confidence Score in Prozent. */
  confidence: number;

  /** Zu prüfendes Feld. */
  feld: ReviewFeld;

  /** Erkannter Originaltext aus dem Befund. */
  originalText: string;

  /** Erkannter Wert nach Parser. */
  erkannterWert: string;

  /** Vorschlag für korrigierte Ausgabe. */
  vorschlag: string;

  /** Begründung für Review-Markierung. */
  grund: string;
}
