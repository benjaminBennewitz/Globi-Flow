/* src/app/pages/wissensbasis-page/wissensbasis-page-logik.ts */

/**
 * @file Zustandslose Fach- und Formatierungslogik der Wissensbasis-Seite.
 * @module WissensbasisPageLogik
 */

import { Wissenseintrag, WissenseintragStatus, Wissensquelle, WissensquelleTyp } from '../../core/models/wissenseintrag.model';

/** Filteroption für Wissenseinträge. */
export type WissensStatusFilter = WissenseintragStatus | 'alle';

/** Formularzustand für Wissenseinträge. */
export interface Wissensformular {
  id: string;                    // Eindeutige Wissens-ID.
  laborwertKey: string;          // Laborwert-Key.
  anzeigename: string;           // Anzeigename.
  kategorie: string;             // Kategorie.
  farbe: string;                 // Stabile Diagrammfarbe.
  patientKurztext: string;       // Kurze Patientenerklärung.
  patientLangtext: string;       // Ausführliche Patientenerklärung.
  arztinformation: string;       // Arztinformation.
  ursachenNiedrig: string;       // Ursachen bei niedrigen Werten.
  ursachenHoch: string;          // Ursachen bei hohen Werten.
  einflussfaktoren: string;      // Einflussfaktoren.
  hinweise: string;              // Hinweise.
  disclaimer: string;            // Medizinischer Hinweistext.
  version: number;               // Aktuelle Textversion.
  status: WissenseintragStatus;  // Freigabestatus.
  quellen: Wissensquelle[];      // Zugeordnete Quellen.
  aenderungsnotiz: string;       // Notiz zur nächsten Version.
}

/** Ergebnis eines Qualitätschecks. */
export interface WissensQualitaetscheck {
  label: string;  // Anzeigename des Prüfpunkts.
  ok: boolean;    // Gibt an, ob der Prüfpunkt erfüllt ist.
}

/** Verfügbare stabile Fallbackfarben. */
const STANDARD_FARBEN: readonly string[] = ['#b91c1c', '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#e11d48', '#be123c', '#9f1239', '#0f766e', '#0369a1', '#1d4ed8', '#4338ca', '#6d28d9', '#86198f', '#a21caf', '#be185d', '#92400e', '#166534', '#0f5297', '#475569'];

/** Lesbare Statusbezeichnungen. */
const STATUS_LABELS: Readonly<Record<WissenseintragStatus, string>> = {
  entwurf: 'ENTWURF',
  pruefung: 'IN PRÜFUNG',
  freigegeben: 'FREIGEGEBEN'
};

/**
 * Ermittelt sortierte Kategorien aus allen Wissenseinträgen.
 *
 * @param eintraege Wissenseinträge der aktuellen API-Antwort.
 * @returns Alphabetisch sortierte, eindeutige Kategorien.
 */
export function verfuegbareKategorienErmitteln(eintraege: readonly Wissenseintrag[]): string[] {
  return Array.from(new Set(eintraege.map((eintrag: Wissenseintrag) => eintrag.kategorie.trim()).filter(Boolean))).sort((a: string, b: string) => a.localeCompare(b, 'de'));
}

/**
 * Prüft einen Wissenseintrag gegen Suche, Status und Kategorie.
 *
 * @param eintrag Zu prüfender Wissenseintrag.
 * @param suche Aktueller Suchbegriff.
 * @param statusFilter Aktiver Statusfilter.
 * @param kategorieFilter Aktiver Kategorienfilter.
 * @returns `true`, wenn der Eintrag alle Filter erfüllt.
 */
export function eintragPasst(eintrag: Wissenseintrag, suche: string, statusFilter: WissensStatusFilter, kategorieFilter: string): boolean {
  const suchbegriff = suche.trim().toLowerCase();  // Normalisierter Suchbegriff.
  const suchtext = `${eintrag.laborwertKey} ${eintrag.anzeigename} ${eintrag.kategorie} ${eintrag.patientKurztext} ${eintrag.quellen.map((quelle: Wissensquelle) => quelle.titel).join(' ')}`.toLowerCase();  // Durchsuchbarer Gesamttext.
  const suchePasst = !suchbegriff || suchtext.includes(suchbegriff);  // Ergebnis der Textsuche.
  const statusPasst = statusFilter === 'alle' || eintrag.status === statusFilter;  // Ergebnis des Statusfilters.
  const kategoriePasst = kategorieFilter === 'alle' || eintrag.kategorie === kategorieFilter;  // Ergebnis des Kategorienfilters.
  return suchePasst && statusPasst && kategoriePasst;
}

/**
 * Erzeugt den editierbaren Formularzustand eines Wissenseintrags.
 *
 * @param eintrag Ausgangseintrag aus der API.
 * @returns Vollständiger Formularzustand mit leerer Änderungsnotiz.
 */
export function formularAusEintrag(eintrag: Wissenseintrag): Wissensformular {
  return {
    id: eintrag.id,
    laborwertKey: eintrag.laborwertKey,
    anzeigename: eintrag.anzeigename,
    kategorie: eintrag.kategorie,
    farbe: eintrag.farbe || standardFarbeFuerKey(eintrag.laborwertKey),
    patientKurztext: eintrag.patientKurztext,
    patientLangtext: eintrag.patientLangtext,
    arztinformation: eintrag.arztinformation,
    ursachenNiedrig: eintrag.ursachenNiedrig,
    ursachenHoch: eintrag.ursachenHoch,
    einflussfaktoren: eintrag.einflussfaktoren,
    hinweise: eintrag.hinweise,
    disclaimer: eintrag.disclaimer,
    version: eintrag.version,
    status: eintrag.status,
    quellen: [...eintrag.quellen],
    aenderungsnotiz: ''
  };
}

/**
 * Überträgt den Formularzustand in einen speicherbaren Wissenseintrag.
 *
 * @param eintrag Bestehender Wissenseintrag mit technischen Metadaten.
 * @param formular Aktueller Formularzustand.
 * @returns Aktualisierter Wissenseintrag für die API.
 */
export function eintragAusFormular(eintrag: Wissenseintrag, formular: Wissensformular): Wissenseintrag {
  const datum = heutigesDatumLabel();  // Einheitliches Änderungsdatum.
  return {
    ...eintrag,
    laborwertKey: formular.laborwertKey,
    anzeigename: formular.anzeigename,
    kategorie: formular.kategorie,
    farbe: normalisiereFarbeingabe(formular.farbe),
    patientKurztext: formular.patientKurztext,
    patientLangtext: formular.patientLangtext,
    arztinformation: formular.arztinformation,
    ursachenNiedrig: formular.ursachenNiedrig,
    ursachenHoch: formular.ursachenHoch,
    einflussfaktoren: formular.einflussfaktoren,
    hinweise: formular.hinweise,
    disclaimer: formular.disclaimer,
    quellen: formular.quellen.map((quelle: Wissensquelle) => ({ ...quelle, stand: normalisiereQuellenStand(quelle.stand) || 'ohne Stand' })),
    version: formular.version,
    status: formular.status,
    geaendertAm: datum,
    geaendertVon: 'Admin',
    versionen: formular.aenderungsnotiz.trim() ? [...eintrag.versionen, { version: formular.version, datum, bearbeitetVon: 'Admin', notiz: formular.aenderungsnotiz.trim() }] : eintrag.versionen
  };
}

/**
 * Ergänzt den API-Payload um die aktuelle Änderungsnotiz.
 *
 * @param eintrag Bestehender Wissenseintrag.
 * @param formular Aktueller Formularzustand.
 * @returns Speicherbarer API-Payload.
 */
export function formularZuEintrag(eintrag: Wissenseintrag, formular: Wissensformular): Wissenseintrag & { aenderungsnotiz?: string } {
  return { ...eintragAusFormular(eintrag, formular), aenderungsnotiz: formular.aenderungsnotiz.trim() };
}

/**
 * Formatiert das aktuelle Datum für Änderungsvermerke.
 *
 * @returns Deutsches Datum im Format `TT.MM.JJJJ`.
 */
export function heutigesDatumLabel(): string {
  return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Normalisiert einen Wissenseintrag für eine konsistente Anzeige.
 *
 * @param eintrag Eintrag aus der Backend-API.
 * @returns Normalisierter Wissenseintrag.
 */
export function wissenseintragNormalisieren(eintrag: Wissenseintrag): Wissenseintrag {
  return {
    ...eintrag,
    farbe: eintrag.farbe || standardFarbeFuerKey(eintrag.laborwertKey),
    quellen: eintrag.quellen.map((quelle: Wissensquelle) => ({ ...quelle, stand: normalisiereQuellenStand(quelle.stand) || 'ohne Stand' }))
  };
}

/**
 * Normalisiert Quellenstände auf `MM.JJJJ`, sofern Monat und Jahr erkennbar sind.
 *
 * @param wert Unverarbeiteter Quellenstand.
 * @returns Normalisierter Quellenstand oder unveränderter Freitext.
 */
export function normalisiereQuellenStand(wert: string): string {
  const rohwert = wert.trim();  // Getrimmter Eingabewert.
  if (!rohwert || rohwert === 'ohne Stand') return rohwert;

  const isoTreffer = rohwert.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);  // ISO-Datum oder ISO-Monat.
  if (isoTreffer) return `${isoTreffer[2].padStart(2, '0')}.${isoTreffer[1]}`;

  const deutschesDatum = rohwert.match(/^(?:\d{1,2}\.)?(\d{1,2})\.(\d{4})$/);  // Deutsches Datum oder Monat/Jahr.
  if (deutschesDatum) return `${deutschesDatum[1].padStart(2, '0')}.${deutschesDatum[2]}`;

  const kompaktDatum = rohwert.match(/^(\d{1,2})\/(\d{4})$/);  // Kompakte Monat/Jahr-Schreibweise.
  if (kompaktDatum) return `${kompaktDatum[1].padStart(2, '0')}.${kompaktDatum[2]}`;

  return rohwert;
}

/**
 * Normalisiert Farbeingaben auf sichere sechsstellige Hexwerte.
 *
 * @param wert Farbeingabe aus dem Editor.
 * @returns Gültiger Hexwert oder stabile Standardfarbe.
 */
export function normalisiereFarbeingabe(wert: string): string {
  const bereinigt = wert.trim();  // Getrimmte Farbeingabe.
  return /^#[0-9a-fA-F]{6}$/.test(bereinigt) ? bereinigt.toLowerCase() : '#0f5297';
}

/**
 * Ermittelt eine stabile Fallbackfarbe anhand des Laborwert-Keys.
 *
 * @param key Fachlicher Laborwert-Key.
 * @returns Deterministisch ausgewählter Hexwert.
 */
export function standardFarbeFuerKey(key: string): string {
  const summe = key.split('').reduce((wert: number, zeichen: string) => wert + zeichen.charCodeAt(0), 0);  // Zeichencodesumme als stabiler Index.
  return STANDARD_FARBEN[summe % STANDARD_FARBEN.length];
}

/**
 * Bildet eine stabile Quellenidentität ohne technische ID.
 *
 * @param quelle Quelle mit Titel, Typ und Referenz.
 * @returns Normalisierter Identitätsschlüssel.
 */
export function quellenIdentitaetsSchluessel(quelle: Pick<Wissensquelle, 'titel' | 'typ' | 'referenz'>): string {
  return `${quellenTitelSchluessel(quelle.titel)}|${quelle.typ}|${quelle.referenz.trim().toLowerCase()}`;
}

/**
 * Normalisiert einen Quellentitel für Vergleiche.
 *
 * @param titel Quellentitel.
 * @returns Getrimmter Titel in Kleinschreibung.
 */
export function quellenTitelSchluessel(titel: string): string {
  return titel.trim().toLowerCase();
}

/**
 * Erzeugt den durchsuchbaren Gesamttext einer Quelle.
 *
 * @param quelle Zu durchsuchende Quelle.
 * @returns Normalisierter Suchtext.
 */
export function quellenSuchtext(quelle: Wissensquelle): string {
  return `${quelle.titel} ${quelle.typ} ${quelle.stand} ${quelle.referenz} ${quelle.hinweis}`.toLowerCase();
}

/**
 * Sortiert Quellenvorschläge nach exakter Übereinstimmung, Präfix und Titel.
 *
 * @param a Erster Quellenvorschlag.
 * @param b Zweiter Quellenvorschlag.
 * @param suche Normalisierter Suchbegriff.
 * @returns Vergleichswert für `Array.sort`.
 */
export function quellenVorschlagSortierung(a: Wissensquelle, b: Wissensquelle, suche: string): number {
  if (!suche) return a.titel.localeCompare(b.titel);

  const aTitel = quellenTitelSchluessel(a.titel);  // Normalisierter Titel A.
  const bTitel = quellenTitelSchluessel(b.titel);  // Normalisierter Titel B.
  const aExakt = aTitel === suche ? 0 : 1;         // Priorität exakter Treffer A.
  const bExakt = bTitel === suche ? 0 : 1;         // Priorität exakter Treffer B.
  const aBeginn = aTitel.startsWith(suche) ? 0 : 1;  // Priorität Präfixtreffer A.
  const bBeginn = bTitel.startsWith(suche) ? 0 : 1;  // Priorität Präfixtreffer B.
  return aExakt - bExakt || aBeginn - bBeginn || a.titel.localeCompare(b.titel);
}

/**
 * Liefert die CSS-Klasse eines Wissensstatus.
 *
 * @param status Fachlicher Wissensstatus.
 * @returns CSS-Modifikatorklasse.
 */
export function statusKlasse(status: WissenseintragStatus): string {
  return `is-${status}`;
}

/**
 * Liefert das lesbare Label eines Wissensstatus.
 *
 * @param status Fachlicher Wissensstatus.
 * @returns Statuslabel in Versalien.
 */
export function statusLabel(status: WissenseintragStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Prüft die Mindestinhalte eines Wissenseintrags.
 *
 * @param eintrag Zu prüfender Wissenseintrag.
 * @returns Liste aller Qualitätsprüfungen.
 */
export function qualitaetsChecks(eintrag: Wissenseintrag): WissensQualitaetscheck[] {
  return [
    { label: 'Patientenkurztext', ok: !!eintrag.patientKurztext.trim() },
    { label: 'Patientenlangtext', ok: !!eintrag.patientLangtext.trim() },
    { label: 'Disclaimer', ok: !!eintrag.disclaimer.trim() },
    { label: 'Quellen', ok: eintrag.quellen.length > 0 },
    { label: 'Freigabe', ok: eintrag.status === 'freigegeben' }
  ];
}

/**
 * Liefert die lesbare Bezeichnung einer Quellenart.
 *
 * @param typ Technischer Quellentyp.
 * @param optionen Verfügbare Quellentypoptionen.
 * @returns Lesbares Label oder Demo-Fallback.
 */
export function quellenTypAnzeigename(typ: WissensquelleTyp, optionen: readonly { key: WissensquelleTyp; label: string }[]): string {
  return optionen.find((option) => option.key === typ)?.label ?? 'Demo';
}
