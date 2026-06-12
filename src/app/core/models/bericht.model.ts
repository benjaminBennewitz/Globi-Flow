/* src/app/core/models/bericht.model.ts */

/**
 * @file Beschreibt druckfertige Patientenberichte.
 * @module BerichtModel
 */

/** Status eines Laborwerts im Patientenbericht. */
export type BerichtWertStatus = 'normal' | 'niedrig' | 'hoch' | 'review';

/** Trendrichtung eines Laborwerts. */
export type BerichtTrend = 'stabil' | 'steigend' | 'fallend';

/** Priorität einer Empfehlung. */
export type BerichtEmpfehlungPrioritaet = 'normal' | 'beachten' | 'wichtig';

/** Laborwert im druckfertigen Patientenbericht. */
export interface BerichtLaborwert {
  /** Stabiler Laborwert-Key. */
  key: string;

  /** Anzeigename. */
  name: string;

  /** Fachliche Gruppe. */
  gruppe: string;

  /** Messwert. */
  wert: number;

  /** Einheit. */
  einheit: string;

  /** Untere Referenzgrenze. */
  referenzMin: number;

  /** Obere Referenzgrenze. */
  referenzMax: number;

  /** Status im Verhältnis zum Referenzbereich. */
  status: BerichtWertStatus;

  /** Trendrichtung. */
  trend: BerichtTrend;

  /** Verständliche Erklärung aus der Wissensbasis. */
  erklaerung: string;

  /** Patiententauglicher Hinweis. */
  hinweis: string;

  /** Verlaufspunkte für die Mini-Grafik. */
  verlauf: number[];
}

/** Zusammenfassung einer Wertgruppe. */
export interface BerichtKategorie {
  /** Name der Wertgruppe. */
  name: string;

  /** Anzahl unauffälliger Werte. */
  normal: number;

  /** Anzahl auffälliger Werte. */
  auffaellig: number;

  /** Anzahl prüfpflichtiger Werte. */
  review: number;
}

/** Empfehlung oder Hinweis im Patientenbericht. */
export interface BerichtEmpfehlung {
  /** Eindeutige ID. */
  id: string;

  /** Titel der Empfehlung. */
  titel: string;

  /** Text der Empfehlung. */
  text: string;

  /** Priorität der Empfehlung. */
  prioritaet: BerichtEmpfehlungPrioritaet;
}

/** Quelle des Patientenberichts. */
export interface BerichtQuelle {
  /** Eindeutige Quellen-ID. */
  id: string;

  /** Zugeordneter Bereich. */
  bereich: string;

  /** Titel der Quelle. */
  titel: string;

  /** Stand oder Version. */
  stand: string;
}

/** Druckfertiger Patientenbericht. */
export interface BerichtViewModel {
  /** Eindeutige Berichts-ID. */
  id: string;

  /** Berichtsdatum. */
  berichtsdatum: string;

  /** Berichtsversion. */
  version: string;

  /** Gesamtstatus als Kurzlabel. */
  gesamtstatus: string;

  /** Verständlicher Gesamttext ohne Diagnose. */
  gesamttext: string;

  /** Anzahl geprüfter Werte. */
  gepruefteWerte: number;

  /** Anzahl unauffälliger Werte. */
  normaleWerte: number;

  /** Anzahl auffälliger Werte. */
  auffaelligeWerte: number;

  /** Anzahl prüfpflichtiger Werte. */
  reviewWerte: number;

  /** Laborwerte für Ergebnisdarstellung. */
  werte: BerichtLaborwert[];

  /** Wertgruppen-Zusammenfassung. */
  kategorien: BerichtKategorie[];

  /** Patiententaugliche Empfehlungen. */
  empfehlungen: BerichtEmpfehlung[];

  /** Fragen für das Arztgespräch. */
  fragen: string[];

  /** Quellen des Berichts. */
  quellen: BerichtQuelle[];

  /** Pflicht-Disclaimer. */
  disclaimer: string;
}
