/* src/app/core/models/wissenseintrag.model.ts */

/**
 * @file Beschreibt kontrollierte Wissensinhalte für Patientenberichte.
 * @module WissenseintragModel
 */

/** Veröffentlichungsstatus eines Wissenseintrags. */
export type WissenseintragStatus = 'entwurf' | 'aktiv' | 'archiviert';

/** Kontrollierter Wissenseintrag für einen Laborwert. */
export interface Wissenseintrag {
  /** Eindeutige Wissens-ID. */
  id: string;

  /** Stabiler Laborwert-Key. */
  laborwertKey: string;

  /** Anzeigename im Editor. */
  anzeigename: string;

  /** Medizinische Kategorie. */
  kategorie: string;

  /** Kurze Patientenerklärung. */
  patientKurztext: string;

  /** Ausführliche Patientenerklärung. */
  patientLangtext: string;

  /** Interne ärztliche Information. */
  arztinformation: string;

  /** Allgemeiner Disclaimer für Bericht und Vorschau. */
  disclaimer: string;

  /** Quellenhinweis als freier Text. */
  quellen: string;

  /** Version des Textstands. */
  version: number;

  /** Veröffentlichungsstatus. */
  status: WissenseintragStatus;
}
