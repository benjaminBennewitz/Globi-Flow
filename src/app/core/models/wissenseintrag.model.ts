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
  id: string;             // Eindeutige Quellen-ID.
  titel: string;          // Titel oder Kurzname der Quelle.
  typ: WissensquelleTyp;  // Quellenart.
  stand: string;          // Stand der Quelle oder fachliche Gültigkeit.
  referenz: string;       // Optionale URL oder Literaturangabe.
  hinweis: string;        // Interner Hinweis zur Quelle.
}

/** Änderungsvermerk eines Wissenseintrags. */
export interface Wissensversion {
  version: number;        // Versionsnummer.
  datum: string;          // Änderungsdatum.
  bearbeitetVon: string;  // Bearbeiterrolle oder Name.
  notiz: string;          // Kurze Änderungsnotiz.
}

/** Kontrollierter Wissenseintrag für einen Laborwert. */
export interface Wissenseintrag {
  id: string;                    // Eindeutige Wissens-ID.
  laborwertKey: string;          // Stabiler Laborwert-Key.
  anzeigename: string;           // Anzeigename im Editor.
  kategorie: string;             // Medizinische Kategorie.
  farbe: string;                 // Stabile Farbe für Diagramme und Verlaufslinien.
  patientKurztext: string;       // Kurze Patientenerklärung.
  patientLangtext: string;       // Ausführliche Patientenerklärung.
  arztinformation: string;       // Interne ärztliche Information.
  ursachenNiedrig: string;       // Mögliche Ursachen bei niedrigen Werten.
  ursachenHoch: string;          // Mögliche Ursachen bei hohen Werten.
  einflussfaktoren: string;      // Einflussfaktoren auf den Laborwert.
  hinweise: string;              // Allgemeine Hinweise für Bericht oder Review.
  disclaimer: string;            // Allgemeiner Disclaimer für Bericht und Vorschau.
  quellen: Wissensquelle[];      // Zugeordnete Quellen.
  version: number;               // Version des Textstands.
  status: WissenseintragStatus;  // Veröffentlichungsstatus.
  geaendertAm: string;           // Letzte Änderung.
  geaendertVon: string;          // Bearbeiterrolle oder Name.
  versionen: Wissensversion[];   // Änderungshistorie.
}
