/* src/app/pages/analyse-page/analyse-page-diagramm.ts */

/**
 * @file Reine Berechnungsfunktionen für Diagramme und SVG-Pfade der Analyseansicht.
 * @module AnalysePageDiagramm
 */

import { AuswertungLaborwert, AuswertungViewModel } from '../../core/models/auswertung.model';
import { MAX_AKTIVE_OVERLAY_WERTE, hatVergleich } from './analyse-page-logik';

const SNAPSHOT_VERLAUF_START_X = 98;  // Linke X-Position einer Snapshot-Linie.
const SNAPSHOT_VERLAUF_END_X = 614;   // Rechte X-Position einer Snapshot-Linie.

/**
 * Berechnet die horizontale Markerposition eines Laborwerts innerhalb seiner erweiterten Skala.
 *
 * @param wert - Laborwert mit Messwert und Referenzbereich.
 * @returns Prozentuale Position als CSS-Wert.
 */
export function markerPosition(wert: AuswertungLaborwert): string {
  const grenzen = skalaGrenzen(wert);
  return `${prozent(wert.wert, grenzen.min, grenzen.max)}%`;
}

/**
 * Berechnet den Startpunkt des Referenzbereichs innerhalb der Werteskala.
 *
 * @param wert - Laborwert mit Referenzminimum.
 * @returns Prozentualer Startpunkt als CSS-Wert.
 */
export function referenzStart(wert: AuswertungLaborwert): string {
  const grenzen = skalaGrenzen(wert);
  return `${prozent(wert.referenzMin, grenzen.min, grenzen.max)}%`;
}

/**
 * Berechnet die sichtbare Breite des Referenzbereichs innerhalb der Werteskala.
 *
 * @param wert - Laborwert mit Referenzminimum und Referenzmaximum.
 * @returns Prozentuale Breite als CSS-Wert.
 */
export function referenzBreite(wert: AuswertungLaborwert): string {
  const grenzen = skalaGrenzen(wert);
  return `${prozent(wert.referenzMax, grenzen.min, grenzen.max) - prozent(wert.referenzMin, grenzen.min, grenzen.max)}%`;
}

/**
 * Erzeugt einen geglätteten SVG-Pfad für den historischen Verlauf eines Laborwerts.
 *
 * @param wert - Laborwert mit zeitlich sortierten Verlaufspunkten.
 * @returns Vollständiger SVG-Pfad oder ein leerer String ohne Verlaufspunkte.
 */
export function verlaufPfad(wert: AuswertungLaborwert): string {
  return weicherSvgPfad(wert.verlauf.map((punkt, index) => ({ x: punktX(wert, index), y: punktY(wert, punkt.wert) })));
}

/**
 * Berechnet die X-Koordinate eines Verlaufspunkts im Detaildiagramm.
 *
 * @param wert - Laborwert mit Anzahl der Verlaufspunkte.
 * @param index - Nullbasierter Index des aktuellen Verlaufspunkts.
 * @returns Gerundete X-Koordinate im SVG-Koordinatensystem.
 */
export function punktX(wert: AuswertungLaborwert, index: number): number {
  return wert.verlauf.length <= 1 ? 242 : runden(46 + (index / Math.max(wert.verlauf.length - 1, 1)) * 392);
}

/**
 * Berechnet die Y-Koordinate eines Messwerts im Detaildiagramm.
 *
 * @param wert - Laborwert zur Bestimmung der dynamischen Diagrammgrenzen.
 * @param messwert - Darzustellender numerischer Messwert.
 * @returns Gerundete Y-Koordinate im SVG-Koordinatensystem.
 */
export function punktY(wert: AuswertungLaborwert, messwert: number): number {
  const grenzen = diagrammGrenzen(wert);
  return runden(154 - prozent(messwert, grenzen.min, grenzen.max) * 1.2);
}

/**
 * Berechnet die obere Y-Position des Referenzbands im Detaildiagramm.
 *
 * @param wert - Laborwert mit Referenzmaximum.
 * @returns Y-Koordinate des oberen Bandrands.
 */
export function referenzBandY(wert: AuswertungLaborwert): number {
  return punktY(wert, wert.referenzMax);
}

/**
 * Berechnet die Höhe des Referenzbands im Detaildiagramm.
 *
 * @param wert - Laborwert mit Referenzminimum und Referenzmaximum.
 * @returns Höhe des Referenzbands mit einer Mindesthöhe von sechs Pixeln.
 */
export function referenzBandHoehe(wert: AuswertungLaborwert): number {
  return Math.max(6, punktY(wert, wert.referenzMin) - punktY(wert, wert.referenzMax));
}

/**
 * Liefert die normalisierte Markerposition für Referenzfeld-Darstellungen.
 *
 * @param wert - Darzustellender Laborwert.
 * @returns Prozentuale Markerposition als CSS-Wert.
 */
export function normalisiertePosition(wert: AuswertungLaborwert): string {
  return markerPosition(wert);
}

/**
 * Erzeugt den SVG-Pfad eines auf den eigenen Referenzbereich normalisierten Verlaufs.
 *
 * @param wert - Laborwert mit Verlauf und Referenzbereich.
 * @returns Geglätteter Verlaufspfad oder horizontale Snapshot-Linie.
 */
export function normalisierteVerlaufPfad(wert: AuswertungLaborwert): string {
  if (istSnapshotVerlauf(wert)) {
    const y = normalisierterPunktY(wert, wert.verlauf[0]?.wert ?? wert.wert);
    return `M ${SNAPSHOT_VERLAUF_START_X.toFixed(1)} ${y.toFixed(1)} L ${SNAPSHOT_VERLAUF_END_X.toFixed(1)} ${y.toFixed(1)}`;
  }

  return weicherSvgPfad(wert.verlauf.map((punkt, index) => ({ x: normalisierterPunktX(wert, index), y: normalisierterPunktY(wert, punkt.wert) })));
}

/**
 * Prüft, ob für einen Laborwert nur ein einzelner Befundpunkt vorliegt.
 *
 * @param wert - Zu prüfender Laborwert.
 * @returns `true`, wenn keine echte Zeitreihe vorhanden ist.
 */
export function istSnapshotVerlauf(wert: AuswertungLaborwert): boolean {
  return wert.verlauf.length <= 1;
}

/**
 * Beschreibt die Funktionsweise des normalisierten Overlay-Diagramms.
 *
 * @param ansicht - Vollständige Auswertungsansicht mit Vergleichsinformationen.
 * @returns Kontextabhängiger Erklärungstext für die Benutzeroberfläche.
 */
export function overlayBeschreibung(ansicht: AuswertungViewModel): string {
  return hatVergleich(ansicht) ? `Bis zu ${MAX_AKTIVE_OVERLAY_WERTE} aktive Linien. Jede Linie nutzt den eigenen Referenzbereich als Y-Achse; die X-Achse zeigt die Befundzeit.` : `Bis zu ${MAX_AKTIVE_OVERLAY_WERTE} aktive Linien. Ohne Vorbefund zeigt der Chart den aktuellen Befund als horizontale Snapshot-Linien. Jede Linie wird auf den eigenen Referenzbereich normalisiert.`;
}

/**
 * Berechnet die X-Koordinate eines Punkts im normalisierten Overlay-Diagramm.
 *
 * @param wert - Laborwert mit Anzahl der Verlaufspunkte.
 * @param index - Nullbasierter Index des Verlaufspunkts.
 * @returns Gerundete X-Koordinate im SVG-Koordinatensystem.
 */
export function normalisierterPunktX(wert: AuswertungLaborwert, index: number): number {
  return wert.verlauf.length <= 1 ? 356 : runden(86 + (index / Math.max(wert.verlauf.length - 1, 1)) * 540);
}

/**
 * Normalisiert einen Messwert relativ zu seinem individuellen Referenzbereich.
 *
 * @param wert - Laborwert mit Referenzminimum und Referenzmaximum.
 * @param messwert - Zu normalisierender Messwert.
 * @returns Gerundete Y-Koordinate mit getrennten Zonen für niedrig, normal und hoch.
 */
export function normalisierterPunktY(wert: AuswertungLaborwert, messwert: number): number {
  const position = (messwert - wert.referenzMin) / Math.max(wert.referenzMax - wert.referenzMin, 0.0001);

  if (position < 0) {
    return runden(158 + Math.min(Math.abs(position), 1) * 44);
  }

  return position > 1 ? runden(96 - Math.min(position - 1, 1) * 58) : runden(158 - position * 62);
}

/**
 * Liefert die X-Koordinate des letzten sichtbaren Punkts einer Overlay-Linie.
 *
 * @param wert - Laborwert mit Verlaufspunkten.
 * @returns X-Koordinate des letzten Punkts oder des Snapshot-Endes.
 */
export function normalisierterLetzterPunktX(wert: AuswertungLaborwert): number {
  return istSnapshotVerlauf(wert) ? SNAPSHOT_VERLAUF_END_X : normalisierterPunktX(wert, Math.max(wert.verlauf.length - 1, 0));
}

/**
 * Liefert die Y-Koordinate des letzten sichtbaren Punkts einer Overlay-Linie.
 *
 * @param wert - Laborwert mit Verlauf und aktuellem Messwert.
 * @returns Normalisierte Y-Koordinate des letzten verfügbaren Messpunkts.
 */
export function normalisierterLetzterPunktY(wert: AuswertungLaborwert): number {
  return normalisierterPunktY(wert, wert.verlauf[wert.verlauf.length - 1]?.wert ?? wert.wert);
}

/**
 * Validiert die fachlich hinterlegte Linienfarbe eines Laborwerts.
 *
 * @param wert - Laborwert mit optionaler Hex-Farbe.
 * @returns Gültige Hex-Farbe oder definierte Ersatzfarbe.
 */
export function wertFarbe(wert: AuswertungLaborwert): string {
  return /^#[0-9a-fA-F]{6}$/.test(wert.farbe || '') ? wert.farbe : '#0f5297';
}

/**
 * Formatiert einen numerischen Wert kompakt mit deutschem Dezimaltrennzeichen.
 *
 * @param wert - Zu formatierende Zahl.
 * @returns Ganzzahl ohne Nachkommastelle oder Zahl mit einer Nachkommastelle.
 */
export function zahlKurz(wert: number): string {
  return Number.isInteger(wert) ? `${wert}` : wert.toFixed(1).replace('.', ',');
}

/**
 * Erzeugt einen geglätteten SVG-Pfad aus vorberechneten Koordinaten.
 *
 * @param punkte - Geordnete Liste der X- und Y-Koordinaten.
 * @returns SVG-Pfad mit kubischen Bézier-Segmenten.
 */
function weicherSvgPfad(punkte: { x: number; y: number }[]): string {
  if (punkte.length === 0) {
    return '';
  }

  if (punkte.length === 1) {
    const startX = runden(Math.max(46, punkte[0].x - 16));
    const endX = runden(punkte[0].x + 16);
    return `M ${startX.toFixed(1)} ${punkte[0].y.toFixed(1)} L ${endX.toFixed(1)} ${punkte[0].y.toFixed(1)}`;
  }

  const segmente = [`M ${punkte[0].x.toFixed(1)} ${punkte[0].y.toFixed(1)}`];

  for (let index = 1; index < punkte.length; index += 1) {
    const vorherigerPunkt = punkte[index - 1];
    const aktuellerPunkt = punkte[index];
    const mittelX = runden((vorherigerPunkt.x + aktuellerPunkt.x) / 2);
    segmente.push(`C ${mittelX.toFixed(1)} ${vorherigerPunkt.y.toFixed(1)}, ${mittelX.toFixed(1)} ${aktuellerPunkt.y.toFixed(1)}, ${aktuellerPunkt.x.toFixed(1)} ${aktuellerPunkt.y.toFixed(1)}`);
  }

  return segmente.join(' ');
}

/**
 * Rechnet einen Wert in einen auf 0 bis 100 begrenzten Prozentwert um.
 *
 * @param wert - Zu normalisierender Ausgangswert.
 * @param min - Untere Skalengrenze.
 * @param max - Obere Skalengrenze.
 * @returns Begrenzter Prozentwert zwischen 0 und 100.
 */
function prozent(wert: number, min: number, max: number): number {
  return Math.min(100, Math.max(0, ((wert - min) / Math.max(max - min, 1)) * 100));
}

/**
 * Bestimmt erweiterte Skalengrenzen für Marker und Referenzfeld.
 *
 * @param wert - Laborwert mit Messwert und Referenzbereich.
 * @returns Untere und obere Skalengrenze inklusive Randabstand.
 */
function skalaGrenzen(wert: AuswertungLaborwert): { min: number; max: number } {
  const span = Math.max(wert.referenzMax - wert.referenzMin, Math.abs(wert.wert - wert.referenzMax), 1);
  return { min: Math.min(wert.referenzMin, wert.wert) - span * 0.18, max: Math.max(wert.referenzMax, wert.wert) + span * 0.18 };
}

/**
 * Bestimmt dynamische Grenzen für das Detaildiagramm eines Laborwerts.
 *
 * @param wert - Laborwert mit Verlauf und Referenzbereich.
 * @returns Minimale und maximale Diagrammgrenze inklusive Padding.
 */
function diagrammGrenzen(wert: AuswertungLaborwert): { min: number; max: number } {
  const daten = [...wert.verlauf.map((punkt) => punkt.wert), wert.referenzMin, wert.referenzMax];
  const minWert = Math.min(...daten);
  const maxWert = Math.max(...daten);
  const padding = Math.max((maxWert - minWert) * 0.18, 1);
  return { min: minWert - padding, max: maxWert + padding };
}

/**
 * Rundet Koordinaten auf eine Nachkommastelle.
 *
 * @param wert - Zu rundender Zahlenwert.
 * @returns Auf eine Nachkommastelle gerundeter Wert.
 */
function runden(wert: number): number {
  return Math.round(wert * 10) / 10;
}
