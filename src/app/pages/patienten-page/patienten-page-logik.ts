/* src/app/pages/patienten-page/patienten-page-logik.ts */

/**
 * @file Zustandslose Hilfsfunktionen für die Patientenverwaltung.
 * @module PatientenPageLogik
 */

import { Patient, PatientGeschlecht, PatientStatus } from '../../core/models/patient.model';

/** Unterstützte Sortierungen der Patientenliste. */
export type PatientenSortierung = 'aktualisiert' | 'review' | 'name';

/** Sichtbare Bezeichnungen der Patientengeschlechter. */
const GESCHLECHT_LABELS: Readonly<Record<PatientGeschlecht, string>> = {
  unbekannt: 'Unbekannt',
  weiblich: 'Weiblich',
  maennlich: 'Männlich',
  divers: 'Divers'
};

/** Sichtbare Bezeichnungen der Patientenstatus. */
const STATUS_LABELS: Readonly<Record<PatientStatus, string>> = {
  aktiv: 'Aktiv',
  review: 'Review offen',
  import: 'Import läuft',
  bericht: 'Bericht',
  leer: 'Keine Befunde'
};

/**
 * Sortiert eine Patientenliste, ohne die übergebene Ausgangsliste zu verändern.
 *
 * @param patienten Zu sortierende Patientenliste.
 * @param sortierung Gewünschtes Sortierkriterium.
 * @returns Neu erzeugte und sortierte Patientenliste.
 */
export function patientenSortieren(patienten: readonly Patient[], sortierung: PatientenSortierung): Patient[] {
  const sortiertePatienten: Patient[] = [...patienten]; // Veränderbare Kopie der gefilterten Patientenliste.

  if (sortierung === 'review') {
    return sortiertePatienten.sort((a: Patient, b: Patient) => b.offeneReviews - a.offeneReviews);
  }

  if (sortierung === 'name') {
    return sortiertePatienten.sort((a: Patient, b: Patient) => a.name.localeCompare(b.name, 'de'));
  }

  return sortiertePatienten.sort((a: Patient, b: Patient) => b.befunde - a.befunde);
}

/**
 * Erstellt die CSS-Modifikatorklasse eines Patientenstatus.
 *
 * @param status Fachlicher Patientenstatus.
 * @returns CSS-Klasse im Format `is-{status}`.
 */
export function patientenStatusKlasse(status: PatientStatus): string {
  return `is-${status}`;
}

/**
 * Ermittelt die sichtbare deutsche Bezeichnung eines Patientenstatus.
 *
 * @param status Fachlicher Patientenstatus.
 * @returns Deutsche Statusbezeichnung.
 */
export function patientenStatusLabel(status: PatientStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Ermittelt die sichtbare deutsche Bezeichnung eines Geschlechtswerts.
 *
 * @param geschlecht Gespeicherter Geschlechtswert.
 * @returns Deutsche Geschlechtsbezeichnung.
 */
export function patientenGeschlechtLabel(geschlecht: PatientGeschlecht): string {
  return GESCHLECHT_LABELS[geschlecht];
}

/**
 * Normalisiert ein deutsches oder bereits ISO-formatiertes Geburtsdatum für die API.
 *
 * @param wert Datumswert im Format `TT.MM.JJJJ` oder `JJJJ-MM-TT`.
 * @returns Normalisierter ISO-Datumswert oder unveränderter bereinigter Eingabewert.
 */
export function geburtsdatumFuerApiNormalisieren(wert: string): string {
  const datum: string = wert.trim();                                    // Bereinigter Datumswert.
  const deutscherTreffer: RegExpMatchArray | null = datum.match(/^(\d{2})\.(\d{2})\.(\d{4})$/); // Treffer eines deutschen Datumsformats.

  if (deutscherTreffer) {
    return `${deutscherTreffer[3]}-${deutscherTreffer[2]}-${deutscherTreffer[1]}`;
  }

  return datum;
}

/**
 * Wandelt eine optionale numerische Texteingabe in eine Zahl um.
 *
 * @param wert Texteingabe mit Punkt oder Komma als Dezimaltrennzeichen.
 * @returns Endliche Zahl oder `null` bei leerer beziehungsweise ungültiger Eingabe.
 */
export function zahlOderNullErmitteln(wert: string): number | null {
  const zahl: number = Number.parseFloat(wert.replace(',', '.')); // Normalisierte numerische Eingabe.

  return Number.isFinite(zahl) ? zahl : null;
}

/**
 * Liest und bereinigt den Wert eines Input- oder Textarea-Events.
 *
 * @param event Ausgelöstes Browser-Eingabeereignis.
 * @returns Unicode-normalisierter und um kritische Zeichen bereinigter Eingabewert.
 */
export function sichererEingabewert(event: Event): string {
  const eingabe: HTMLInputElement | HTMLTextAreaElement = event.target as HTMLInputElement | HTMLTextAreaElement; // Auslösendes Formularelement.

  return eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '');
}
