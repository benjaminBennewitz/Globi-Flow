/* src/app/core/models/patientenbericht.model.ts */

/**
 * @file Beschreibt freigegebene Patientenberichte.
 * @module PatientenberichtModel
 */

/** Abschnitt eines Patientenberichts. */
export interface PatientenberichtAbschnitt {
  key: string;    // Eindeutiger Abschnittsschlüssel.
  titel: string;  // Überschrift des Abschnitts.
  text: string;   // Verständlicher Abschnittstext.
}

/** Fragevorschlag für das Arztgespräch. */
export interface Patientenfrage {
  id: string;       // Eindeutige Frage-ID.
  frage: string;    // Text der Frage.
  bereich: string;  // Zugehöriger Themenbereich.
}

/** Patientenbericht aus freigegebenen Daten. */
export interface Patientenbericht {
  id: string;                               // Eindeutige Berichts-ID.
  testperson: string;                       // Name der Testperson.
  berichtsdatum: string;                    // Datum des Berichts.
  zusammenfassung: string;                  // Kurze Zusammenfassung.
  abschnitte: PatientenberichtAbschnitt[];  // Verständliche Berichtsteile.
  fragen: Patientenfrage[];                 // Sinnvolle Fragen für das Arztgespräch.
  disclaimer: string;                       // Pflicht-Disclaimer.
}
