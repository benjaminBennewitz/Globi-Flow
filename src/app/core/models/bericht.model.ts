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
  key: string;                // Stabiler Laborwert-Key.
  name: string;               // Anzeigename.
  gruppe: string;             // Fachliche Gruppe.
  wert: number;               // Messwert.
  einheit: string;            // Einheit.
  referenzMin: number;        // Untere Referenzgrenze.
  referenzMax: number;        // Obere Referenzgrenze.
  status: BerichtWertStatus;  // Status im Verhältnis zum Referenzbereich.
  trend: BerichtTrend;        // Trendrichtung.
  erklaerung: string;         // Verständliche Erklärung aus der Wissensbasis.
  hinweis: string;            // Patiententauglicher Hinweis.
  verlauf: number[];          // Verlaufspunkte für die Mini-Grafik.
}

/** Zusammenfassung einer Wertgruppe. */
export interface BerichtKategorie {
  name: string;        // Name der Wertgruppe.
  normal: number;      // Anzahl unauffälliger Werte.
  auffaellig: number;  // Anzahl auffälliger Werte.
  review: number;      // Anzahl prüfpflichtiger Werte.
}

/** Empfehlung oder Hinweis im Patientenbericht. */
export interface BerichtEmpfehlung {
  id: string;                               // Eindeutige ID.
  titel: string;                            // Titel der Empfehlung.
  text: string;                             // Text der Empfehlung.
  prioritaet: BerichtEmpfehlungPrioritaet;  // Priorität der Empfehlung.
}

/** Quelle des Patientenberichts. */
export interface BerichtQuelle {
  id: string;       // Eindeutige Quellen-ID.
  bereich: string;  // Zugeordneter Bereich.
  titel: string;    // Titel der Quelle.
  stand: string;    // Stand oder Version.
}


/** Kompakter Prüfpunkt für Bericht-Freigaben. */
export interface BerichtPruefEintrag {
  id: string;       // Eindeutige ID.
  name: string;     // Anzeigename des betroffenen Werts.
  gruppe: string;   // Fachliche Gruppe.
  hinweis: string;  // Erklärung des Prüfpunkts.
}

/** Metadaten einer lokalen maschinellen Übersetzung. */
export interface BerichtUebersetzung {
  quelle: string;       // Quellsprache.
  ziel: string;         // Zielsprache.
  engine: string;       // Verwendete lokale Engine.
  maschinell: boolean;  // Kennzeichnung einer nicht manuell geprüften Übersetzung.
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
  code: string;   // ISO-Sprachcode.
  label: string;  // Sichtbares Sprachlabel.
}

/** Vollständige, backendseitig gepflegte Berichtsvorlage. */
export interface BerichtTemplate {
  sprache: string;                                                // Aktuelle Sprache der Vorlage.
  zielsprachen: BerichtZielsprache[];                             // Unterstützte Zielsprachen.
  oberflaeche: BerichtOberflaecheTexte;                           // Texte für Steuerung, Freigabe und Übersetzung.
  bericht: BerichtDruckTexte;                                     // Texte innerhalb der Druckseiten.
  statusLabels: Record<BerichtWertStatus, string>;                // Sichtbare Statusbezeichnungen.
  prioritaetLabels: Record<BerichtEmpfehlungPrioritaet, string>;  // Sichtbare Prioritätsbezeichnungen.
}

/** Druckfertiger Patientenbericht. */
export interface BerichtViewModel {
  template: BerichtTemplate;                          // Vollständige backendseitige Textvorlage.
  id: string;                                         // Eindeutige Berichts-ID.
  berichtsdatum: string;                              // Berichtsdatum.
  version: string;                                    // Berichtsversion.
  gesamtstatus: string;                               // Gesamtstatus als Kurzlabel.
  gesamttext: string;                                 // Verständlicher Gesamttext ohne Diagnose.
  gesamtWerte?: number;                               // Anzahl aller Laborwerte im Bericht.
  gepruefteWerte: number;                             // Anzahl geprüfter Werte.
  normaleWerte: number;                               // Anzahl unauffälliger Werte.
  auffaelligeWerte: number;                           // Anzahl auffälliger Werte.
  reviewWerte: number;                                // Anzahl prüfpflichtiger Werte.
  werte: BerichtLaborwert[];                          // Laborwerte für Ergebnisdarstellung.
  kategorien: BerichtKategorie[];                     // Wertgruppen-Zusammenfassung.
  empfehlungen: BerichtEmpfehlung[];                  // Patiententaugliche Empfehlungen.
  fragen: string[];                                   // Fragen für das Arztgespräch.
  quellen: BerichtQuelle[];                           // Quellen des Berichts.
  disclaimer: string;                                 // Pflicht-Disclaimer.
  istDruckbar?: boolean;                              // Gibt an, ob der Bericht ohne offene Reviews druckbar ist.
  wissensbasisVollstaendig?: boolean;                 // Gibt an, ob für alle Werte Patiententexte vorhanden sind.
  fehlendeWissensbasisTexte?: BerichtPruefEintrag[];  // Werte ohne Patiententext in der Wissensbasis.
  offeneReviewEintraege?: BerichtPruefEintrag[];      // Noch offene Reviewpunkte aus dem Backend.
  uebersetzung?: BerichtUebersetzung;                 // Optionale Metadaten der Live-Übersetzung.
}
