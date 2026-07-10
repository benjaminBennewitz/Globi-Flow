/* src/app/core/models/review.model.ts */

/**
 * @file Beschreibt ärztliche Review-Daten für erkannte Laborwert-Kandidaten.
 * @module ReviewModel
 */

/** Status eines Review-Eintrags. */
export type ReviewStatus = 'offen' | 'korrigiert' | 'bestaetigt' | 'verworfen' | 'blockiert';

/** Status eines Plausibilitätschecks. */
export type ReviewCheckStatus = 'ok' | 'pruefen' | 'fehlt' | 'konflikt';

/** Quelle eines Review-Eintrags. */
export type ReviewQuelle = 'pdf_text' | 'ocr' | 'manuell' | 'demo';

/** Plausibilitätscheck eines erkannten Kandidaten. */
export interface ReviewCheck {
  id: string;                 // Eindeutige Check-ID.
  titel: string;              // Titel des Checks.
  beschreibung: string;       // Ergebnistext des Checks.
  status: ReviewCheckStatus;  // Status des Checks.
}

/** Einzelner Review-Kandidat. */
export interface ReviewKandidat {
  id: string;                  // Eindeutige Review-ID.
  patientId: string;           // Zugehörige Patient-ID.
  befundId: string;            // Zugehörige Befund-ID.
  laborwertKey: string;        // Fachlicher Laborwert-Key.
  anzeigename: string;         // Normalisierter Anzeigename.
  erkannterName: string;       // Vom Parser erkannter Name.
  erkannterWert: string;       // Vom Parser erkannter Wert als Rohtext.
  korrigierterWert: number;    // Korrigierter numerischer Wert.
  erkannteEinheit: string;     // Vom Parser erkannte Einheit.
  korrigierteEinheit: string;  // Korrigierte Einheit.
  referenzMin: number;         // Untere Referenzgrenze.
  referenzMax: number;         // Obere Referenzgrenze.
  originalText: string;        // Originalzeile oder OCR-Ausschnitt.
  originalLabel: string;       // Zusatzlabel für die Quelle im Originaldokument.
  confidence: number;          // Confidence in Prozent.
  status: ReviewStatus;        // Reviewstatus.
  gruppe: string;              // Wertgruppe.
  quelle: ReviewQuelle;        // Extraktionsquelle.
  kommentar: string;           // Kommentar des Arztes oder Prüfers.
  parserHinweise: string[];    // Parserhinweise.
  checks: ReviewCheck[];       // Plausibilitätschecks.
}

/** Kompakte Kennzahl der Reviewroute. */
export interface ReviewKennzahl {
  label: string;          // Anzeigename der Kennzahl.
  wert: string | number;  // Anzeigenwert.
  hinweis: string;        // Kurzer Kontext.
  icon: string;           // Material-Symbol.
  status?: string;        // Optionale Statusklasse.
}

/** Vollständiges ViewModel der Reviewroute. */
export interface ReviewViewModel {
  kandidaten: ReviewKandidat[];  // Zu prüfende Kandidaten.
}
