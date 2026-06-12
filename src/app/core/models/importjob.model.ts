/* src/app/core/models/importjob.model.ts */

/**
 * @file Beschreibt Importjobs für lokale Laborbefund-Analysen.
 * @module ImportjobModel
 */

/** Fachlicher Status eines Importjobs. */
export type ImportjobStatus = 'wartet' | 'analysiert' | 'review' | 'abgeschlossen' | 'fehler';

/** Art der lokalen Analyse. */
export type ImportjobAnalyseArt = 'textschicht' | 'ocr' | 'demo';

/** Status eines Pipeline-Schritts. */
export type ImportjobSchrittStatus = 'erledigt' | 'aktiv' | 'wartet' | 'fehler' | 'uebersprungen';

/** OCR-Status eines Importjobs. */
export type ImportjobOcrStatus = 'nicht_erforderlich' | 'erforderlich' | 'aktiv' | 'abgeschlossen' | 'fehler';

/** Status eines erkannten Dataset-Bereichs. */
export type ImportjobDatasetStatus = 'normal' | 'review' | 'fehler';

/** Einzelner Verarbeitungsschritt innerhalb eines Importjobs. */
export interface ImportjobSchritt {
  /** Eindeutiger technischer Schlüssel des Schritts. */
  key: string;

  /** Lesbarer Name für die Oberfläche. */
  name: string;

  /** Kurzer Hinweis zum aktuellen Schritt. */
  beschreibung: string;

  /** Status des Pipeline-Schritts. */
  status: ImportjobSchrittStatus;

  /** Gibt an, ob der Schritt bereits abgeschlossen ist. */
  abgeschlossen: boolean;
}

/** Log-Eintrag eines Importjobs. */
export interface ImportjobLogEintrag {
  /** Eindeutige Log-ID. */
  id: string;

  /** Lesbarer Zeitpunkt. */
  zeitpunkt: string;

  /** Kurzer Log-Titel. */
  titel: string;

  /** Beschreibung des Ereignisses. */
  beschreibung: string;

  /** Status des Ereignisses. */
  status: ImportjobStatus | 'info';
}

/** Erkannte Datengruppe innerhalb eines Importjobs. */
export interface ImportjobDataset {
  /** Eindeutige Dataset-ID. */
  id: string;

  /** Anzeigename der Datengruppe. */
  name: string;

  /** Anzahl erkannter Werte. */
  werte: number;

  /** Anzahl prüfpflichtiger Werte. */
  review: number;

  /** Durchschnittliche Confidence der Gruppe. */
  confidence: number;

  /** Status der Gruppe. */
  status: ImportjobDatasetStatus;
}

/** Importjob aus API oder Mockdaten. */
export interface Importjob {
  /** Eindeutige Job-ID. */
  id: string;

  /** Anzeigename der Quelldatei. */
  dateiname: string;

  /** Optionale Testperson oder Patientenzuordnung. */
  testperson: string;

  /** Art der lokalen Analyse. */
  analyseArt: ImportjobAnalyseArt;

  /** Aktueller Importstatus. */
  status: ImportjobStatus;

  /** Fortschritt in Prozent. */
  fortschritt: number;

  /** Aktueller Pipeline-Schritt. */
  pipelineSchritt: string;

  /** OCR-Status. */
  ocrStatus: ImportjobOcrStatus;

  /** Anzahl erkannter Laborwerte. */
  erkannteWerte: number;

  /** Anzahl unsicherer Laborwerte. */
  unsichereWerte: number;

  /** Durchschnittliche Erkennungssicherheit. */
  confidence: number;

  /** Zeitpunkt der Erstellung. */
  erstelltAm: string;

  /** Zeitpunkt der letzten Aktualisierung. */
  aktualisiertAm: string;

  /** Optionale Fehlermeldung für blockierte Jobs. */
  fehlermeldung?: string;

  /** Verarbeitungsschritte für Statusanzeigen. */
  schritte: ImportjobSchritt[];

  /** Erkannte Dataset-Gruppen des Imports. */
  datasets: ImportjobDataset[];

  /** Auditierbare Log-Ereignisse des Imports. */
  logEintraege: ImportjobLogEintrag[];
}
