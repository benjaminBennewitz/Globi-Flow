/* src/app/core/models/importjob.model.ts */

/**
 * @file Beschreibt Importjobs für lokale Laborbefund-Analysen.
 * @module ImportjobModel
 */

/** Fachlicher Status eines Importjobs. */
export type ImportjobStatus = 'wartet' | 'analysiert' | 'review' | 'abgeschlossen' | 'fehler';

/** Einzelner Verarbeitungsschritt innerhalb eines Importjobs. */
export interface ImportjobSchritt {
  /** Eindeutiger technischer Schlüssel des Schritts. */
  key: string;

  /** Lesbarer Name für die Oberfläche. */
  name: string;

  /** Kurzer Hinweis zum aktuellen Schritt. */
  beschreibung: string;

  /** Gibt an, ob der Schritt bereits abgeschlossen ist. */
  abgeschlossen: boolean;
}

/** Importjob aus API oder Mockdaten. */
export interface Importjob {
  /** Eindeutige Job-ID. */
  id: string;

  /** Anzeigename der Quelldatei. */
  dateiname: string;

  /** Art der lokalen Analyse. */
  analyseArt: 'textschicht' | 'ocr' | 'demo';

  /** Aktueller Importstatus. */
  status: ImportjobStatus;

  /** Fortschritt in Prozent. */
  fortschritt: number;

  /** Anzahl erkannter Laborwerte. */
  erkannteWerte: number;

  /** Anzahl unsicherer Laborwerte. */
  unsichereWerte: number;

  /** Durchschnittliche Erkennungssicherheit. */
  confidence: number;

  /** Zeitpunkt der letzten Aktualisierung. */
  aktualisiertAm: string;

  /** Verarbeitungsschritte für Statusanzeigen. */
  schritte: ImportjobSchritt[];
}
