/* src/app/pages/uebersicht-page/uebersicht-page-logik.ts */

/**
 * @file Bündelt zustandslose Konfigurationen und Berechnungen der Übersichtsseite.
 * @module UebersichtPageLogik
 */

import { AktivitaetsEintrag, AktivitaetsFilter, DringenderHinweis, GesundheitsverlaufPunkt, UebersichtAktionStatus, UebersichtDetailEintrag, UebersichtViewModel } from '../../core/models/uebersicht.model';

/** Beschreibt einen festen Schritt des geführten Übersichtsworkflows. */
export interface UebersichtWorkflowSchritt {
  nummer: string;  // Fortlaufende sichtbare Schrittnummer.
  titel: string;   // Kurzer Titel des Workflowschritts.
  text: string;    // Erläuterung der zugehörigen Aufgabe.
  route: string;   // Zielroute des Workflowschritts.
  icon: string;    // Material-Symbol für die Darstellung.
  status: string;  // Visueller Status des Workflowschritts.
}

/** Beschreibt einen Monatseintrag für die Range-Auswahl. */
export interface UebersichtMonat {
  wert: number;    // Numerischer Monatswert von 1 bis 12.
  label: string;   // Kurzlabel des Monats.
}

/** Beschreibt eine viewportbegrenzte Overlayposition. */
export interface UebersichtOverlayPosition {
  x: number;  // Horizontale Position in Pixeln.
  y: number;  // Vertikale Position in Pixeln.
}

/** Geführter Kernworkflow vom Patientenkontext bis zum Bericht. */
export const UEBERSICHT_WORKFLOW_SCHRITTE: readonly UebersichtWorkflowSchritt[] = [
  { nummer: '01', titel: 'Patient wählen', text: 'Arbeitskontext setzen oder neue Testperson anlegen.', route: '/patienten', icon: 'assignment_ind', status: 'bereit' },
  { nummer: '02', titel: 'Befund importieren', text: 'PDF analysieren, Rohtext extrahieren und Werte erkennen.', route: '/importe', icon: 'upload_file', status: 'aktiv' },
  { nummer: '03', titel: 'Daten prüfen', text: 'Nur unsichere oder auffällige Extraktionen manuell korrigieren.', route: '/review', icon: 'fact_check', status: 'offen' },
  { nummer: '04', titel: 'Tendenzen auswerten', text: 'Normalisierte Werte, Referenzbereiche und Verlauf überlagern.', route: '/auswertung', icon: 'monitoring', status: 'bereit' },
  { nummer: '05', titel: 'Bericht freigeben', text: 'Patientenverständliche Zusammenfassung aus geprüften Daten erzeugen.', route: '/berichte', icon: 'article', status: 'gesperrt' }
];

/** Verfügbare Jahre des aktuell bereitgestellten Verlaufsdatensatzes. */
export const UEBERSICHT_JAHRE: readonly number[] = [2024, 2025, 2026];

/** Verfügbare Monate für den Range-Filter des Verlaufsdiagramms. */
export const UEBERSICHT_MONATE: readonly UebersichtMonat[] = [
  { wert: 1, label: 'Jan' }, { wert: 2, label: 'Feb' }, { wert: 3, label: 'Mär' }, { wert: 4, label: 'Apr' },
  { wert: 5, label: 'Mai' }, { wert: 6, label: 'Jun' }, { wert: 7, label: 'Jul' }, { wert: 8, label: 'Aug' },
  { wert: 9, label: 'Sep' }, { wert: 10, label: 'Okt' }, { wert: 11, label: 'Nov' }, { wert: 12, label: 'Dez' }
];

/**
 * Liefert das Kurzlabel eines Monats.
 *
 * @param monat Numerischer Monatswert von 1 bis 12.
 * @returns Passendes Kurzlabel oder einen leeren Text bei unbekanntem Wert.
 */
export function monatsLabelErmitteln(monat: number): string {
  return UEBERSICHT_MONATE.find((eintrag: UebersichtMonat) => eintrag.wert === monat)?.label ?? '';
}

/**
 * Filtert einen Gesundheitsverlauf nach Jahr und Monatsbereich.
 *
 * @param verlauf Vollständiger Gesundheitsverlauf.
 * @param jahr Ausgewähltes Kalenderjahr.
 * @param monatVon Erster sichtbarer Monat.
 * @param monatBis Letzter sichtbarer Monat.
 * @returns Gefilterte Verlaufspunkte in ihrer ursprünglichen Reihenfolge.
 */
export function sichtbarenVerlaufErmitteln(verlauf: GesundheitsverlaufPunkt[], jahr: number, monatVon: number, monatBis: number): GesundheitsverlaufPunkt[] {
  return verlauf.filter((punkt: GesundheitsverlaufPunkt) => punkt.jahr === jahr && punkt.monat >= monatVon && punkt.monat <= monatBis);
}

/**
 * Berechnet die SVG-Punktliste einer Verlaufslinie.
 *
 * @param verlauf Bereits gefilterte Verlaufspunkte.
 * @param key Auszuwertende Kennzahl der Verlaufspunkte.
 * @returns Leerzeichengetrennte SVG-Koordinaten.
 */
export function verlaufPunkteErmitteln(verlauf: GesundheitsverlaufPunkt[], key: 'unauffaellig' | 'auffaellig'): string {
  return verlauf.map((punkt: GesundheitsverlaufPunkt, index: number) => `${punktXErmitteln(verlauf, index).toFixed(1)},${punktYErmitteln(verlauf, punkt[key]).toFixed(1)}`).join(' ');
}

/**
 * Berechnet die horizontale SVG-Position eines Verlaufspunkts.
 *
 * @param verlauf Sichtbare Verlaufspunkte.
 * @param index Index des gesuchten Punkts.
 * @returns Horizontale SVG-Koordinate.
 */
export function punktXErmitteln(verlauf: GesundheitsverlaufPunkt[], index: number): number {
  const maxIndex: number = Math.max(verlauf.length - 1, 1);  // Verhindert eine Division durch null.
  return 54 + (index / maxIndex) * 1052;
}

/**
 * Berechnet die vertikale SVG-Position eines Verlaufswerts auf gemeinsamer Skala.
 *
 * @param verlauf Sichtbare Verlaufspunkte beider Linien.
 * @param wert Zu positionierender Zahlenwert.
 * @returns Vertikale SVG-Koordinate.
 */
export function punktYErmitteln(verlauf: GesundheitsverlaufPunkt[], wert: number): number {
  const alleWerte: number[] = [...verlauf.map((punkt: GesundheitsverlaufPunkt) => punkt.unauffaellig), ...verlauf.map((punkt: GesundheitsverlaufPunkt) => punkt.auffaellig)];  // Gemeinsame Skalenwerte.
  const minimum: number = Math.min(...alleWerte);            // Kleinster sichtbarer Wert.
  const maximum: number = Math.max(...alleWerte);            // Größter sichtbarer Wert.
  const spannweite: number = Math.max(maximum - minimum, 1); // Sichere Skalenbreite.
  return 238 - ((wert - minimum) / spannweite) * 168;
}

/**
 * Liefert die Detailzeilen eines KPI-Overlays.
 *
 * @param uebersicht Geladenes Übersichts-ViewModel.
 * @param typ Gewünschter KPI-Typ.
 * @returns Passende Import- oder Reviewdetails.
 */
export function kpiDetailsErmitteln(uebersicht: UebersichtViewModel, typ: 'importe' | 'review'): UebersichtDetailEintrag[] {
  return typ === 'importe' ? uebersicht.ungepruefteImporte ?? [] : uebersicht.reviewOffenListe ?? [];
}

/**
 * Filtert Aktivitäten anhand des ausgewählten Zeitraums.
 *
 * @param aktivitaeten Vollständiges Aktivitätsprotokoll.
 * @param filter Aktiver Zeitraumfilter.
 * @returns Aktivitäten innerhalb des gewählten Zeitraums.
 */
export function aktivitaetenFiltern(aktivitaeten: AktivitaetsEintrag[], filter: AktivitaetsFilter): AktivitaetsEintrag[] {
  const maxTagOffset: number = filter === 'heute' ? 0 : filter === 'gestern' ? 1 : filter === 'drei_tage' ? 3 : 7;  // Maximal erlaubter Tagesabstand.
  return filter === 'gestern'
    ? aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset === 1)
    : aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset <= maxTagOffset);
}

/**
 * Erzeugt die CSS-Statusklasse einer Übersichtsaktion.
 *
 * @param status Fachlicher Status der Aktion.
 * @returns CSS-Klasse mit Statuspräfix.
 */
export function statusKlasseErmitteln(status: UebersichtAktionStatus): string {
  return `is-${status}`;
}

/**
 * Liefert das Material-Symbol für einen dringenden Hinweis.
 *
 * @param hinweis Darzustellender Hinweis.
 * @returns Passender Symbolname für kritisch, Warnung oder Information.
 */
export function hinweisIconErmitteln(hinweis: DringenderHinweis): string {
  return hinweis.status === 'kritisch' ? 'priority_high' : hinweis.status === 'warnung' ? 'warning' : 'info';
}

/**
 * Berechnet eine viewportbegrenzte Overlayposition.
 *
 * @param event Mausereignis mit Cursorposition.
 * @param istBreit Gibt an, ob das breite Overlayformat verwendet wird.
 * @param viewportBreite Aktuelle Breite des Browserfensters.
 * @param viewportHoehe Aktuelle Höhe des Browserfensters.
 * @returns Begrenzte X- und Y-Koordinate des Overlays.
 */
export function overlayPositionErmitteln(event: MouseEvent, istBreit: boolean, viewportBreite: number, viewportHoehe: number): UebersichtOverlayPosition {
  const rand: number = 16;                                                           // Mindestabstand zum Viewportrand.
  const breite: number = Math.min(istBreit ? 560 : 470, viewportBreite - rand * 2);  // Effektive Overlaybreite.
  const hoehe: number = Math.min(520, viewportHoehe - rand * 2);                     // Effektive Overlayhöhe.
  const zielX: number = event.clientX + 16;                                          // Gewünschte Cursorposition horizontal.
  const zielY: number = event.clientY + 16;                                          // Gewünschte Cursorposition vertikal.
  return {
    x: Math.max(rand, Math.min(zielX, viewportBreite - breite - rand)),
    y: Math.max(rand, Math.min(zielY, viewportHoehe - hoehe - rand))
  };
}
/**
 * Prüft, ob ein Ziel einen Wechsel des aktiven Patienten erfordert.
 *
 * @param ziel Hinweis- oder KPI-Ziel.
 * @param aktivePatientId ID des aktuell aktiven Patienten.
 * @returns `true`, wenn beide IDs vorhanden sind und voneinander abweichen.
 */
export function zielBrauchtPatientenwechsel(ziel: DringenderHinweis | UebersichtDetailEintrag, aktivePatientId: string): boolean {
  return !!ziel.patientId && !!aktivePatientId && ziel.patientId !== aktivePatientId;
}

/**
 * Erzeugt die Queryparameter für eine kontextbezogene Zielnavigation.
 *
 * @param ziel Hinweis- oder KPI-Ziel.
 * @returns Queryparameter und ID des später zu markierenden Zielelements.
 */
export function zielNavigationErmitteln(ziel: DringenderHinweis | UebersichtDetailEintrag): { queryParams: Record<string, string>; suchFokus: string } {
  const queryParams: Record<string, string> = {};                                           // Kontextparameter der Zielroute.
  const suchFokus: string = 'targetId' in ziel && ziel.targetId ? ziel.targetId : ziel.id;  // Zu markierendes Zielelement.

  if (ziel.patientId) {
    queryParams['patient'] = ziel.patientId;
  }

  if (ziel.befundId) {
    queryParams['befund'] = ziel.befundId;
    queryParams['reportId'] = ziel.befundId;
  }

  if (suchFokus) {
    queryParams['suchFokus'] = suchFokus;
    queryParams['suchLabel'] = ziel.titel;
  }

  return { queryParams, suchFokus };
}

/**
 * Escaped einen Wert für die sichere Verwendung in CSS-Selektoren.
 *
 * @param wert Ungeprüfter Selektorwert.
 * @returns Browserkompatibel escapeter Selektorwert.
 */
export function cssWertEscapen(wert: string): string {
  if ('CSS' in window && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(wert);
  }

  return wert.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

/**
 * Markiert ein Zielelement kurz sichtbar und scrollt es in den Viewport.
 *
 * @param targetId Eindeutiger lokaler Suchbezeichner.
 */
export function zielMarkieren(targetId: string): void {
  const escapeterWert: string = cssWertEscapen(targetId);                                                                                  // Sicherer CSS-Selektorwert.
  const ziel: Element | null = document.querySelector(`[data-gf-search-id="${escapeterWert}"], [data-gf-search-target="${escapeterWert}"]`);  // Gefundenes Zielelement.

  if (!(ziel instanceof HTMLElement)) {
    return;
  }

  ziel.classList.add('gf-overview__local-focus');
  ziel.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  window.setTimeout(() => ziel.classList.remove('gf-overview__local-focus'), 2400);
}

