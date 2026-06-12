/* src/app/core/models/patient.model.ts */

/**
 * @file Beschreibt zentrale Testpersonen, Befunde und globalen Arbeitskontext.
 * @module PatientModel
 */

/** Geschlechtsangabe für Testpersonen. */
export type PatientGeschlecht = 'weiblich' | 'maennlich' | 'divers' | 'unbekannt';

/** Quelle oder Art einer Testperson. */
export type PatientQuelle = 'demo' | 'verlauf' | 'ocr' | 'manuell';

/** Arbeitsstatus einer Testperson. */
export type PatientStatus = 'aktiv' | 'review' | 'import' | 'bericht' | 'leer';

/** Status eines hinterlegten Befunds. */
export type PatientBefundStatus = 'importiert' | 'review_offen' | 'freigegeben' | 'bericht_bereit' | 'ocr_review';

/** Hinterlegter Befund einer Testperson. */
export interface PatientBefund {
  /** Eindeutige Befund-ID. */
  id: string;

  /** Anzeigename oder Dateiname. */
  name: string;

  /** Befunddatum. */
  datum: string;

  /** Fachlicher Status des Befunds. */
  status: PatientBefundStatus;

  /** Anzahl erkannter Laborwerte. */
  werte: number;

  /** Anzahl offener Reviewwerte. */
  offeneReviews: number;
}

/** Testperson oder später Patient im lokalen System. */
export interface Patient {
  /** Eindeutige Patient-ID. */
  id: string;

  /** Lesbare Testpersonen-ID. */
  nummer: string;

  /** Anzeigename für kompakte UI-Stellen. */
  name: string;

  /** Vorname der fiktiven Testperson. */
  vorname: string;

  /** Nachname der fiktiven Testperson. */
  nachname: string;

  /** Geburtsdatum der fiktiven Testperson. */
  geburtsdatum: string;

  /** Geschlechtsangabe für Referenzbereiche. */
  geschlecht: PatientGeschlecht;

  /** Körpergewicht in Kilogramm. */
  gewichtKg: number | null;

  /** Körpergröße in Zentimetern. */
  groesseCm: number | null;

  /** Kurzer Lebensstil-Hinweis für Anamnese-Kontext. */
  lebensstil: string;

  /** Kurzer Kontext zur Datenquelle. */
  kontext: string;

  /** Quelle der Testperson. */
  quelle: PatientQuelle;

  /** Aktueller Arbeitsstatus. */
  status: PatientStatus;

  /** Anzahl hinterlegter Befunde. */
  befunde: number;

  /** Anzahl offener Reviewwerte. */
  offeneReviews: number;

  /** Letztes Befunddatum. */
  letzterBefund: string;

  /** Kurzer Berichtstatus. */
  berichtStatus: string;

  /** Interne Notiz zu Testdaten. */
  notiz: string;

  /** Hinterlegte Befunde der Testperson. */
  befundListe: PatientBefund[];
}

/** Eingabe für eine neue Testperson. */
export interface NeuerPatientInput {
  /** Vorname der Testperson. */
  vorname: string;

  /** Nachname der Testperson. */
  nachname: string;

  /** Lesbare Testpersonen-ID. */
  nummer: string;

  /** Optionales Geburtsdatum. */
  geburtsdatum: string;

  /** Geschlechtsangabe. */
  geschlecht: PatientGeschlecht;

  /** Optionales Gewicht in Kilogramm. */
  gewichtKg: number | null;

  /** Optionale Größe in Zentimetern. */
  groesseCm: number | null;

  /** Lebensstil-Hinweis. */
  lebensstil: string;

  /** Interne Notiz. */
  notiz: string;
}
