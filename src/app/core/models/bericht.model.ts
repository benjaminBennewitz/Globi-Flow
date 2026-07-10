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


/** Kompakter Prüfpunkt für Bericht-Freigaben. */
export interface BerichtPruefEintrag {
  /** Eindeutige ID. */
  id: string;

  /** Anzeigename des betroffenen Werts. */
  name: string;

  /** Fachliche Gruppe. */
  gruppe: string;

  /** Erklärung des Prüfpunkts. */
  hinweis: string;
}

/** Metadaten einer lokalen maschinellen Übersetzung. */
export interface BerichtUebersetzung {
  /** Quellsprache. */
  quelle: string;

  /** Zielsprache. */
  ziel: string;

  /** Verwendete lokale Engine. */
  engine: string;

  /** Kennzeichnung einer nicht manuell geprüften Übersetzung. */
  maschinell: boolean;
}

/** Sichtbare Texte der ärztlichen Berichtseite. */
export interface BerichtOberflaecheTexte {
  [key: string]: string;
}

/** Sichtbare Texte innerhalb des druckbaren Patientenberichts. */
export interface BerichtDruckTexte {
  [key: string]: string;
}

/** Verfügbare Zielsprache der lokalen Übersetzung. */
export interface BerichtZielsprache {
  /** ISO-Sprachcode. */
  code: string;

  /** Sichtbares Sprachlabel. */
  label: string;
}

/** Vollständige, backendseitig gepflegte Berichtsvorlage. */
export interface BerichtTemplate {
  /** Aktuelle Sprache der Vorlage. */
  sprache: string;

  /** Unterstützte Zielsprachen. */
  zielsprachen: BerichtZielsprache[];

  /** Texte für Steuerung, Freigabe und Übersetzung. */
  oberflaeche: BerichtOberflaecheTexte;

  /** Texte innerhalb der Druckseiten. */
  bericht: BerichtDruckTexte;

  /** Sichtbare Statusbezeichnungen. */
  statusLabels: Record<BerichtWertStatus, string>;

  /** Sichtbare Prioritätsbezeichnungen. */
  prioritaetLabels: Record<BerichtEmpfehlungPrioritaet, string>;
}

/** Druckfertiger Patientenbericht. */
export interface BerichtViewModel {
  /** Vollständige backendseitige Textvorlage. */
  template: BerichtTemplate;

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

  /** Anzahl aller Laborwerte im Bericht. */
  gesamtWerte?: number;

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

  /** Gibt an, ob der Bericht ohne offene Reviews druckbar ist. */
  istDruckbar?: boolean;

  /** Gibt an, ob für alle Werte Patiententexte vorhanden sind. */
  wissensbasisVollstaendig?: boolean;

  /** Werte ohne Patiententext in der Wissensbasis. */
  fehlendeWissensbasisTexte?: BerichtPruefEintrag[];

  /** Noch offene Reviewpunkte aus dem Backend. */
  offeneReviewEintraege?: BerichtPruefEintrag[];

  /** Optionale Metadaten der Live-Übersetzung. */
  uebersetzung?: BerichtUebersetzung;
}
