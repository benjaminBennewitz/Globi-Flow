/* src/app/core/models/patientenbericht.model.ts */

/**
 * @file Beschreibt freigegebene Patientenberichte.
 * @module PatientenberichtModel
 */

/** Abschnitt eines Patientenberichts. */
export interface PatientenberichtAbschnitt {
  /** Eindeutiger Abschnittsschlüssel. */
  key: string;

  /** Überschrift des Abschnitts. */
  titel: string;

  /** Verständlicher Abschnittstext. */
  text: string;
}

/** Fragevorschlag für das Arztgespräch. */
export interface Patientenfrage {
  /** Eindeutige Frage-ID. */
  id: string;

  /** Text der Frage. */
  frage: string;

  /** Zugehöriger Themenbereich. */
  bereich: string;
}

/** Patientenbericht aus freigegebenen Daten. */
export interface Patientenbericht {
  /** Eindeutige Berichts-ID. */
  id: string;

  /** Name der Testperson. */
  testperson: string;

  /** Datum des Berichts. */
  berichtsdatum: string;

  /** Kurze Zusammenfassung. */
  zusammenfassung: string;

  /** Verständliche Berichtsteile. */
  abschnitte: PatientenberichtAbschnitt[];

  /** Sinnvolle Fragen für das Arztgespräch. */
  fragen: Patientenfrage[];

  /** Pflicht-Disclaimer. */
  disclaimer: string;
}
