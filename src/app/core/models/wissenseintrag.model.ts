/* src/app/core/models/wissenseintrag.model.ts */

/**
 * @file Beschreibt kontrollierte Wissensinhalte für Patientenberichte.
 * @module WissenseintragModel
 */

/** Veröffentlichungsstatus eines Wissenseintrags. */
export type WissenseintragStatus = 'entwurf' | 'pruefung' | 'freigegeben';

/** Quellenart eines Wissenseintrags. */
export type WissensquelleTyp = 'leitlinie' | 'laborlexikon' | 'fachliteratur' | 'intern' | 'demo';

/** Quelle oder Referenz eines kontrollierten Wissenseintrags. */
export interface Wissensquelle {
  /** Eindeutige Quellen-ID. */
  id: string;

  /** Titel oder Kurzname der Quelle. */
  titel: string;

  /** Quellenart. */
  typ: WissensquelleTyp;

  /** Stand der Quelle oder fachliche Gültigkeit. */
  stand: string;

  /** Optionale URL oder Literaturangabe. */
  referenz: string;

  /** Interner Hinweis zur Quelle. */
  hinweis: string;
}

/** Änderungsvermerk eines Wissenseintrags. */
export interface Wissensversion {
  /** Versionsnummer. */
  version: number;

  /** Änderungsdatum. */
  datum: string;

  /** Bearbeiterrolle oder Name. */
  bearbeitetVon: string;

  /** Kurze Änderungsnotiz. */
  notiz: string;
}

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

  /** Mögliche Ursachen bei niedrigen Werten. */
  ursachenNiedrig: string;

  /** Mögliche Ursachen bei hohen Werten. */
  ursachenHoch: string;

  /** Einflussfaktoren auf den Laborwert. */
  einflussfaktoren: string;

  /** Allgemeine Hinweise für Bericht oder Review. */
  hinweise: string;

  /** Allgemeiner Disclaimer für Bericht und Vorschau. */
  disclaimer: string;

  /** Zugeordnete Quellen. */
  quellen: Wissensquelle[];

  /** Version des Textstands. */
  version: number;

  /** Veröffentlichungsstatus. */
  status: WissenseintragStatus;

  /** Letzte Änderung. */
  geaendertAm: string;

  /** Bearbeiterrolle oder Name. */
  geaendertVon: string;

  /** Änderungshistorie. */
  versionen: Wissensversion[];
}
