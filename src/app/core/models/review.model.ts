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
  /** Eindeutige Check-ID. */
  id: string;

  /** Titel des Checks. */
  titel: string;

  /** Ergebnistext des Checks. */
  beschreibung: string;

  /** Status des Checks. */
  status: ReviewCheckStatus;
}

/** Einzelner Review-Kandidat. */
export interface ReviewKandidat {
  /** Eindeutige Review-ID. */
  id: string;

  /** Zugehörige Patient-ID. */
  patientId: string;

  /** Zugehörige Befund-ID. */
  befundId: string;

  /** Fachlicher Laborwert-Key. */
  laborwertKey: string;

  /** Normalisierter Anzeigename. */
  anzeigename: string;

  /** Vom Parser erkannter Name. */
  erkannterName: string;

  /** Vom Parser erkannter Wert als Rohtext. */
  erkannterWert: string;

  /** Korrigierter numerischer Wert. */
  korrigierterWert: number;

  /** Vom Parser erkannte Einheit. */
  erkannteEinheit: string;

  /** Korrigierte Einheit. */
  korrigierteEinheit: string;

  /** Untere Referenzgrenze. */
  referenzMin: number;

  /** Obere Referenzgrenze. */
  referenzMax: number;

  /** Originalzeile oder OCR-Ausschnitt. */
  originalText: string;

  /** Zusatzlabel für die Quelle im Originaldokument. */
  originalLabel: string;

  /** Confidence in Prozent. */
  confidence: number;

  /** Reviewstatus. */
  status: ReviewStatus;

  /** Wertgruppe. */
  gruppe: string;

  /** Extraktionsquelle. */
  quelle: ReviewQuelle;

  /** Kommentar des Arztes oder Prüfers. */
  kommentar: string;

  /** Parserhinweise. */
  parserHinweise: string[];

  /** Plausibilitätschecks. */
  checks: ReviewCheck[];
}

/** Kompakte Kennzahl der Reviewroute. */
export interface ReviewKennzahl {
  /** Anzeigename der Kennzahl. */
  label: string;

  /** Anzeigenwert. */
  wert: string | number;

  /** Kurzer Kontext. */
  hinweis: string;

  /** Material-Symbol. */
  icon: string;

  /** Optionale Statusklasse. */
  status?: string;
}

/** Vollständiges ViewModel der Reviewroute. */
export interface ReviewViewModel {
  /** Zu prüfende Kandidaten. */
  kandidaten: ReviewKandidat[];
}
