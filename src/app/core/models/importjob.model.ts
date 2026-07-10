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
  key: string;                     // Eindeutiger technischer Schlüssel des Schritts.
  name: string;                    // Lesbarer Name für die Oberfläche.
  beschreibung: string;            // Kurzer Hinweis zum aktuellen Schritt.
  status: ImportjobSchrittStatus;  // Status des Pipeline-Schritts.
  abgeschlossen: boolean;          // Gibt an, ob der Schritt bereits abgeschlossen ist.
}

/** Log-Eintrag eines Importjobs. */
export interface ImportjobLogEintrag {
  id: string;                        // Eindeutige Log-ID.
  zeitpunkt: string;                 // Lesbarer Zeitpunkt.
  titel: string;                     // Kurzer Log-Titel.
  beschreibung: string;              // Beschreibung des Ereignisses.
  status: ImportjobStatus | 'info';  // Status des Ereignisses.
}

/** Erkannte Datengruppe innerhalb eines Importjobs. */
export interface ImportjobDataset {
  id: string;                      // Eindeutige Dataset-ID.
  name: string;                    // Anzeigename der Datengruppe.
  werte: number;                   // Anzahl erkannter Werte.
  review: number;                  // Anzahl prüfpflichtiger Werte.
  confidence: number;              // Durchschnittliche Confidence der Gruppe.
  status: ImportjobDatasetStatus;  // Status der Gruppe.
}

/** Importjob aus API oder Mockdaten. */
export interface Importjob {
  id: string;                           // Eindeutige Job-ID.
  dateiname: string;                    // Anzeigename der Quelldatei.
  testperson: string;                   // Optionale Testperson oder Patientenzuordnung.
  analyseArt: ImportjobAnalyseArt;      // Art der lokalen Analyse.
  status: ImportjobStatus;              // Aktueller Importstatus.
  fortschritt: number;                  // Fortschritt in Prozent.
  pipelineSchritt: string;              // Aktueller Pipeline-Schritt.
  ocrStatus: ImportjobOcrStatus;        // OCR-Status.
  erkannteWerte: number;                // Anzahl erkannter Laborwerte.
  unsichereWerte: number;               // Anzahl unsicherer Laborwerte.
  confidence: number;                   // Durchschnittliche Erkennungssicherheit.
  erstelltAm: string;                   // Zeitpunkt der Erstellung.
  aktualisiertAm: string;               // Zeitpunkt der letzten Aktualisierung.
  fehlermeldung?: string;               // Optionale Fehlermeldung für blockierte Jobs.
  schritte: ImportjobSchritt[];         // Verarbeitungsschritte für Statusanzeigen.
  datasets: ImportjobDataset[];         // Erkannte Dataset-Gruppen des Imports.
  logEintraege: ImportjobLogEintrag[];  // Auditierbare Log-Ereignisse des Imports.
}
