/* src/app/core/models/uebersicht.model.ts */

/**
 * @file Beschreibt aggregierte Übersichts- und Praxisdaten.
 * @module UebersichtModel
 */

/** Status einer allgemeinen Arzt-Aktion. */
export type UebersichtAktionStatus = 'kritisch' | 'warnung' | 'info' | 'erledigt';

/** Filter für das Aktivitätsprotokoll. */
export type AktivitaetsFilter = 'heute' | 'gestern' | 'drei_tage' | 'sieben_tage';

/** Detailzeile für KPI-Overlays. */
export interface UebersichtDetailEintrag {
  /** Eindeutige Backend-ID. */
  id: string;

  /** Sichtbarer Titel. */
  titel: string;

  /** Kurzbeschreibung mit Patient, Befund oder Status. */
  beschreibung: string;

  /** Optionaler Patientenkontext. */
  patientId?: string;

  /** Sichtbarer Patientenname. */
  patientName?: string;

  /** Optionaler Befundkontext. */
  befundId?: string;

  /** Zielroute für Detailansicht. */
  route?: string;

  /** Anzeigepriorität. */
  status: UebersichtAktionStatus;

  /** ISO-Datum oder leerer Wert. */
  datum?: string;
}

/** Aggregierte Kennzahlen für die Praxisübersicht. */
export interface UebersichtKennzahlen {
  /** Anzahl aller Testpatienten. */
  patientenGesamt: number;

  /** Anzahl aller importierten Befunde. */
  berichteGesamt: number;

  /** Anzahl geprüfter Importjobs. */
  importeGeprueft: number;

  /** Anzahl ungeprüfter Importjobs. */
  importeUngeprueft: number;

  /** Anzahl freigegebener Patientenberichte. */
  berichteFreigegeben: number;

  /** Anzahl offener Review-Fälle. */
  reviewOffen: number;
}

/** Verlaufspunkt für aggregierte Gesundheitsdaten. */
export interface GesundheitsverlaufPunkt {
  /** Jahr des Verlaufspunkts. */
  jahr: number;

  /** Monat des Verlaufspunkts als Zahl von 1 bis 12. */
  monat: number;

  /** Kurzlabel für die Zeitachse. */
  label: string;

  /** Anzahl unauffälliger Blutbilder. */
  unauffaellig: number;

  /** Anzahl Blutbilder mit auffälligen Werten. */
  auffaellig: number;
}

/** Dringender Hinweis für die Arztübersicht. */
export interface DringenderHinweis {
  /** Eindeutige Hinweis-ID. */
  id: string;

  /** Titel des Hinweises. */
  titel: string;

  /** Beschreibung des Problems. */
  beschreibung: string;

  /** Seit wann der Fall offen ist. */
  seit: string;

  /** Priorität für die Anzeige. */
  status: UebersichtAktionStatus;

  /** Zielroute für den Hinweis. */
  route?: string;

  /** Patientenkontext des Hinweises. */
  patientId?: string;

  /** Sichtbarer Patientenname. */
  patientName?: string;

  /** Befundkontext des Hinweises. */
  befundId?: string;

  /** Konkretes Zielelement. */
  targetId?: string;
}

/** Eintrag im Aktivitätsprotokoll. */
export interface AktivitaetsEintrag {
  /** Eindeutige Protokoll-ID. */
  id: string;

  /** Zeitpunkt der Aktivität. */
  zeitpunkt: string;

  /** Abstand in Tagen für lokale Filter. */
  tagOffset: number;

  /** Titel der Aktivität. */
  titel: string;

  /** Detailtext der Aktivität. */
  beschreibung: string;

  /** Status der Aktivität. */
  status: UebersichtAktionStatus;
}

/** Aggregiertes ViewModel für die Übersicht. */
export interface UebersichtViewModel {
  /** Kennzahlen für die obere Übersicht. */
  kennzahlen: UebersichtKennzahlen;

  /** Verlauf aller Testpatienten. */
  gesundheitsverlauf: GesundheitsverlaufPunkt[];

  /** Dringende Hinweise für alte oder riskante Fälle. */
  dringendeHinweise: DringenderHinweis[];

  /** Letzte Aktivitäten und Importereignisse. */
  aktivitaeten: AktivitaetsEintrag[];

  /** Liste ungeprüfter oder fehlerhafter Importe. */
  ungepruefteImporte?: UebersichtDetailEintrag[];

  /** Liste offener oder blockierender Reviewwerte. */
  reviewOffenListe?: UebersichtDetailEintrag[];
}
