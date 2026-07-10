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
  id: string;                      // Eindeutige Backend-ID.
  titel: string;                   // Sichtbarer Titel.
  beschreibung: string;            // Kurzbeschreibung mit Patient, Befund oder Status.
  patientId?: string;              // Optionaler Patientenkontext.
  patientName?: string;            // Sichtbarer Patientenname.
  befundId?: string;               // Optionaler Befundkontext.
  route?: string;                  // Zielroute für Detailansicht.
  status: UebersichtAktionStatus;  // Anzeigepriorität.
  datum?: string;                  // ISO-Datum oder leerer Wert.
}

/** Aggregierte Kennzahlen für die Praxisübersicht. */
export interface UebersichtKennzahlen {
  patientenGesamt: number;      // Anzahl aller Testpatienten.
  berichteGesamt: number;       // Anzahl aller importierten Befunde.
  importeGeprueft: number;      // Anzahl geprüfter Importjobs.
  importeUngeprueft: number;    // Anzahl ungeprüfter Importjobs.
  berichteFreigegeben: number;  // Anzahl freigegebener Patientenberichte.
  reviewOffen: number;          // Anzahl offener Review-Fälle.
}

/** Verlaufspunkt für aggregierte Gesundheitsdaten. */
export interface GesundheitsverlaufPunkt {
  jahr: number;          // Jahr des Verlaufspunkts.
  monat: number;         // Monat des Verlaufspunkts als Zahl von 1 bis 12.
  label: string;         // Kurzlabel für die Zeitachse.
  unauffaellig: number;  // Anzahl unauffälliger Blutbilder.
  auffaellig: number;    // Anzahl Blutbilder mit auffälligen Werten.
}

/** Dringender Hinweis für die Arztübersicht. */
export interface DringenderHinweis {
  id: string;                      // Eindeutige Hinweis-ID.
  titel: string;                   // Titel des Hinweises.
  beschreibung: string;            // Beschreibung des Problems.
  seit: string;                    // Seit wann der Fall offen ist.
  status: UebersichtAktionStatus;  // Priorität für die Anzeige.
  route?: string;                  // Zielroute für den Hinweis.
  patientId?: string;              // Patientenkontext des Hinweises.
  patientName?: string;            // Sichtbarer Patientenname.
  befundId?: string;               // Befundkontext des Hinweises.
  targetId?: string;               // Konkretes Zielelement.
}

/** Eintrag im Aktivitätsprotokoll. */
export interface AktivitaetsEintrag {
  id: string;                      // Eindeutige Protokoll-ID.
  zeitpunkt: string;               // Zeitpunkt der Aktivität.
  tagOffset: number;               // Abstand in Tagen für lokale Filter.
  titel: string;                   // Titel der Aktivität.
  beschreibung: string;            // Detailtext der Aktivität.
  status: UebersichtAktionStatus;  // Status der Aktivität.
}

/** Aggregiertes ViewModel für die Übersicht. */
export interface UebersichtViewModel {
  kennzahlen: UebersichtKennzahlen;                // Kennzahlen für die obere Übersicht.
  gesundheitsverlauf: GesundheitsverlaufPunkt[];   // Verlauf aller Testpatienten.
  dringendeHinweise: DringenderHinweis[];          // Dringende Hinweise für alte oder riskante Fälle.
  aktivitaeten: AktivitaetsEintrag[];              // Letzte Aktivitäten und Importereignisse.
  ungepruefteImporte?: UebersichtDetailEintrag[];  // Liste ungeprüfter oder fehlerhafter Importe.
  reviewOffenListe?: UebersichtDetailEintrag[];    // Liste offener oder blockierender Reviewwerte.
}
