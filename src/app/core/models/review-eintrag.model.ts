/* src/app/core/models/review-eintrag.model.ts */

/**
 * @file Beschreibt ärztliche Review-Einträge für unsichere Laborwerte.
 * @module ReviewEintragModel
 */

/** Feld, das im Review geprüft oder korrigiert werden kann. */
export type ReviewFeld = 'wert' | 'einheit' | 'referenzbereich' | 'zuordnung';

/** Einzelner Review-Eintrag aus API oder Mockdaten. */
export interface ReviewEintrag {
  id: string;             // Eindeutige Review-ID.
  laborwertKey: string;   // Zugehöriger Laborwert-Key.
  laborwertName: string;  // Anzeigename des Laborwerts.
  confidence: number;     // Confidence Score in Prozent.
  feld: ReviewFeld;       // Zu prüfendes Feld.
  originalText: string;   // Erkannter Originaltext aus dem Befund.
  erkannterWert: string;  // Erkannter Wert nach Parser.
  vorschlag: string;      // Vorschlag für korrigierte Ausgabe.
  grund: string;          // Begründung für Review-Markierung.
}
