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
  id: string;                   // Eindeutige Befund-ID.
  name: string;                 // Anzeigename oder Dateiname.
  datum: string;                // Befunddatum.
  status: PatientBefundStatus;  // Fachlicher Status des Befunds.
  werte: number;                // Anzahl erkannter Laborwerte.
  offeneReviews: number;        // Anzahl offener Reviewwerte.
}

/** Testperson oder später Patient im lokalen System. */
export interface Patient {
  id: string;                     // Eindeutige Patient-ID.
  nummer: string;                 // Lesbare Testpersonen-ID.
  name: string;                   // Anzeigename für kompakte UI-Stellen.
  vorname: string;                // Vorname der fiktiven Testperson.
  nachname: string;               // Nachname der fiktiven Testperson.
  geburtsdatum: string;           // Geburtsdatum der fiktiven Testperson.
  geschlecht: PatientGeschlecht;  // Geschlechtsangabe für Referenzbereiche.
  gewichtKg: number | null;       // Körpergewicht in Kilogramm.
  groesseCm: number | null;       // Körpergröße in Zentimetern.
  lebensstil: string;             // Kurzer Lebensstil-Hinweis für Anamnese-Kontext.
  nichtrauchen: boolean;          // Gibt an, ob die Testperson nicht raucht.
  alkohol: boolean;               // Gibt an, ob Alkoholkonsum dokumentiert ist.
  drogen: boolean;                // Gibt an, ob Drogenkonsum dokumentiert ist.
  kontext: string;                // Kurzer Kontext zur Datenquelle.
  quelle: PatientQuelle;          // Quelle der Testperson.
  status: PatientStatus;          // Aktueller Arbeitsstatus.
  befunde: number;                // Anzahl hinterlegter Befunde.
  offeneReviews: number;          // Anzahl offener Reviewwerte.
  letzterBefund: string;          // Letztes Befunddatum.
  berichtStatus: string;          // Kurzer Berichtstatus.
  notiz: string;                  // Interne Notiz zu Testdaten.
  befundListe: PatientBefund[];   // Hinterlegte Befunde der Testperson.
}

/** Eingabe für eine neue Testperson. */
export interface NeuerPatientInput {
  vorname: string;                // Vorname der Testperson.
  nachname: string;               // Nachname der Testperson.
  nummer: string;                 // Lesbare Testpersonen-ID.
  geburtsdatum: string;           // Optionales Geburtsdatum.
  geschlecht: PatientGeschlecht;  // Geschlechtsangabe.
  gewichtKg: number | null;       // Optionales Gewicht in Kilogramm.
  groesseCm: number | null;       // Optionale Größe in Zentimetern.
  lebensstil: string;             // Lebensstil-Hinweis.
  nichtrauchen: boolean;          // Gibt an, ob die Testperson nicht raucht.
  alkohol: boolean;               // Gibt an, ob Alkoholkonsum dokumentiert ist.
  drogen: boolean;                // Gibt an, ob Drogenkonsum dokumentiert ist.
  notiz: string;                  // Interne Notiz.
}
