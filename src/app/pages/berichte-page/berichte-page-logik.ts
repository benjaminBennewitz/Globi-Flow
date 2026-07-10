/* src/app/pages/berichte-page/berichte-page-logik.ts */

/**
 * @file Reine Berechnungs- und Formatierungslogik der Berichtsvorschau.
 * @module BerichtePageLogik
 */

import { BerichtLaborwert } from '../../core/models/bericht.model';
import { Patient } from '../../core/models/patient.model';

/** Struktur der aggregierten Statuswerte einer Berichtskategorie. */
export interface BerichtKategorieStatus {
  normal: number;       // Anzahl unauffälliger Laborwerte.
  auffaellig: number;   // Anzahl auffälliger Laborwerte.
  review: number;       // Anzahl prüfpflichtiger Laborwerte.
}

/**
 * Berechnet das Alter einer Person am festgelegten Berichtstag.
 *
 * @param patient Person, deren Alter berechnet wird.
 * @returns Vollendetes Lebensalter am Berichtstag.
 */
export function alter(patient: Patient): number {
  const geburtsdatum = new Date(patient.geburtsdatum);  // Geburtsdatum der Person.
  const referenzdatum = new Date('2026-06-12');         // Festgelegter Stichtag des Demo-Berichts.
  const lebensjahre = referenzdatum.getFullYear() - geburtsdatum.getFullYear();
  const hatteGeburtstag = referenzdatum.getMonth() > geburtsdatum.getMonth() || (referenzdatum.getMonth() === geburtsdatum.getMonth() && referenzdatum.getDate() >= geburtsdatum.getDate());

  return hatteGeburtstag ? lebensjahre : lebensjahre - 1;
}

/**
 * Berechnet den Body-Mass-Index ohne medizinische Einordnung.
 *
 * @param patient Person mit optionalen Größen- und Gewichtsdaten.
 * @param nichtAngegeben Fallbacktext für unvollständige Stammdaten.
 * @returns BMI mit deutschem Dezimaltrennzeichen oder Fallbacktext.
 */
export function bmi(patient: Patient, nichtAngegeben: string): string {
  if (!patient.gewichtKg || !patient.groesseCm) {
    return nichtAngegeben;
  }

  const groesseMeter = patient.groesseCm / 100;  // Körpergröße in Metern.
  return (patient.gewichtKg / (groesseMeter * groesseMeter)).toFixed(1).replace('.', ',');
}

/**
 * Berechnet die Markerposition eines Laborwerts im Referenzbalken.
 *
 * @param wert Laborwert mit Messwert und Referenzbereich.
 * @returns Begrenzte Markerposition in Prozent.
 */
export function markerPosition(wert: BerichtLaborwert): number {
  const { min, spannweite } = skala(wert);
  return begrenzen(((wert.wert - min) / spannweite) * 100, 4, 96);
}

/**
 * Berechnet den prozentualen Startpunkt des Referenzbereichs.
 *
 * @param wert Laborwert mit Referenzuntergrenze.
 * @returns Startposition des Referenzbereichs in Prozent.
 */
export function referenzStart(wert: BerichtLaborwert): number {
  const { min, spannweite } = skala(wert);
  return begrenzen(((wert.referenzMin - min) / spannweite) * 100, 0, 100);
}

/**
 * Berechnet die prozentuale Breite des Referenzbereichs.
 *
 * @param wert Laborwert mit Referenzunter- und Referenzobergrenze.
 * @returns Breite des Referenzbereichs in Prozent.
 */
export function referenzBreite(wert: BerichtLaborwert): number {
  const { spannweite } = skala(wert);
  return begrenzen(((wert.referenzMax - wert.referenzMin) / spannweite) * 100, 8, 100);
}

/**
 * Erzeugt die Punktfolge für eine kompakte SVG-Verlaufslinie.
 *
 * @param wert Laborwert mit optionalen historischen Messwerten.
 * @returns Leerzeichengetrennte SVG-Koordinaten.
 */
export function sparklinePunkte(wert: BerichtLaborwert): string {
  const werte = wert.verlauf.length ? wert.verlauf : [wert.wert];  // Verfügbare Verlaufsmessungen.
  const min = Math.min(...werte);                                  // Kleinster Verlaufsmesswert.
  const max = Math.max(...werte);                                  // Größter Verlaufsmesswert.
  const spannweite = Math.max(max - min, 1);                       // Sichere vertikale Skalenspannweite.

  return werte.map((punkt: number, index: number) => {
    const x = werte.length === 1 ? 50 : (index / Math.max(werte.length - 1, 1)) * 100;  // Horizontale Punktposition.
    const y = 34 - ((punkt - min) / spannweite) * 28;                                // Vertikale Punktposition.
    return `${x.toFixed(1)},${begrenzen(y, 4, 34).toFixed(1)}`;
  }).join(' ');
}

/**
 * Summiert alle Statusgruppen einer Berichtskategorie.
 *
 * @param kategorie Aggregierte Statuswerte einer Kategorie.
 * @returns Gesamtzahl der Laborwerte in der Kategorie.
 */
export function kategorieGesamt(kategorie: BerichtKategorieStatus): number {
  return kategorie.normal + kategorie.auffaellig + kategorie.review;
}

/**
 * Berechnet den prozentualen Anteil eines Teilwerts.
 *
 * @param teil Teilmenge der Kategorie.
 * @param gesamt Gesamtmenge der Kategorie.
 * @returns Prozentualer Anteil oder 0 bei leerer Gesamtmenge.
 */
export function kategorieAnteil(teil: number, gesamt: number): number {
  return gesamt > 0 ? (teil / gesamt) * 100 : 0;
}

/**
 * Teilt eine Liste in feste Seitengruppen.
 *
 * @param werte Zu gruppierende Listeneinträge.
 * @param groesse Maximale Anzahl von Einträgen je Seite.
 * @param leereSeite Legt fest, ob für leere Listen eine leere Seite entsteht.
 * @returns Seitengruppen mit maximal der angegebenen Größe.
 */
export function seitengruppen<T>(werte: T[], groesse: number, leereSeite = true): T[][] {
  const seiten: T[][] = [];  // Aufbereitete Seitengruppen.

  for (let index = 0; index < werte.length; index += groesse) {
    seiten.push(werte.slice(index, index + groesse));
  }

  return seiten.length ? seiten : leereSeite ? [[]] : [];
}

/**
 * Ermittelt die gemeinsame Skala für Messwert und Referenzbereich.
 *
 * @param wert Laborwert, dessen Skala berechnet wird.
 * @returns Minimalwert und sichere Skalenspannweite.
 */
function skala(wert: BerichtLaborwert): { min: number; spannweite: number } {
  const min = Math.min(wert.referenzMin, wert.wert);          // Kleinster darzustellender Wert.
  const max = Math.max(wert.referenzMax, wert.wert);          // Größter darzustellender Wert.
  const spannweite = Math.max(max - min, 1);                  // Sichere Skalenspannweite.

  return { min, spannweite };
}

/**
 * Begrenzt eine Zahl auf den angegebenen Wertebereich.
 *
 * @param wert Zu begrenzende Zahl.
 * @param min Kleinster zulässiger Wert.
 * @param max Größter zulässiger Wert.
 * @returns Zahl innerhalb des festgelegten Wertebereichs.
 */
function begrenzen(wert: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, wert));
}
