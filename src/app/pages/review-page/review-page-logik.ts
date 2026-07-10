/* src/app/pages/review-page/review-page-logik.ts */

/**
 * @file Bündelt zustandslose Berechnungen und Formatierungen der Review-Seite.
 * @module ReviewPageLogik
 */

import { ReviewCheckStatus, ReviewKandidat, ReviewKennzahl, ReviewStatus, ReviewViewModel } from '../../core/models/review.model';

/** Filter der Review-Warteschlange. */
export type ReviewFilter = ReviewStatus | 'alle';

/** Lesbare Statusbezeichnungen der Reviewkandidaten. */
const STATUS_LABELS: Record<ReviewStatus, string> = {
  offen: 'OFFEN',
  korrigiert: 'KORRIGIERT',
  bestaetigt: 'BESTÄTIGT',
  verworfen: 'VERWORFEN',
  blockiert: 'BLOCKIERT'
};

/** Lesbare Bezeichnungen der Extraktionsquellen. */
const QUELLEN_LABELS: Record<ReviewKandidat['quelle'], string> = {
  pdf_text: 'PDF-Text',
  ocr: 'OCR',
  manuell: 'Manuell',
  demo: 'Demo'
};

/**
 * Liefert ausschließlich Reviewkandidaten des aktiven Patienten und Befunds.
 *
 * @param ansicht Vollständiger Reviewzustand.
 * @param patientId ID des aktiven Patienten.
 * @param befundId ID des aktiven Befunds oder `undefined`.
 * @returns Kandidaten des aktiven Arbeitskontexts.
 */
export function kandidatenFuerReviewKontext(ansicht: ReviewViewModel, patientId: string, befundId: string | undefined): ReviewKandidat[] {
  return ansicht.kandidaten.filter((kandidat: ReviewKandidat) => kandidat.patientId === patientId && kandidat.befundId === befundId);
}

/**
 * Erstellt die Kennzahlenkarten für den aktuellen Reviewkontext.
 *
 * @param kandidaten Kandidaten des aktiven Arbeitskontexts.
 * @returns Kennzahlen für offene, unsichere, korrigierte, bestätigte und blockierende Werte.
 */
export function reviewKennzahlen(kandidaten: ReviewKandidat[]): ReviewKennzahl[] {
  return [
    { label: 'Offen', wert: reviewStatusAnzahl(kandidaten, 'offen'), hinweis: 'zu prüfen', icon: 'pending_actions', status: 'warning' },
    { label: 'Unsicher', wert: kandidaten.filter((kandidat: ReviewKandidat) => kandidat.confidence < 75).length, hinweis: 'Confidence < 75 %', icon: 'priority_high', status: 'danger' },
    { label: 'Korrigiert', wert: reviewStatusAnzahl(kandidaten, 'korrigiert'), hinweis: 'gespeichert', icon: 'edit_note', status: 'info' },
    { label: 'Bestätigt', wert: reviewStatusAnzahl(kandidaten, 'bestaetigt'), hinweis: 'bereit zur Übernahme', icon: 'verified', status: 'success' },
    { label: 'Blockierend', wert: reviewStatusAnzahl(kandidaten, 'blockiert'), hinweis: 'Konflikt prüfen', icon: 'block', status: 'danger' }
  ];
}

/**
 * Filtert und sortiert Reviewkandidaten für die Warteschlange.
 *
 * @param kandidaten Kandidaten des aktiven Arbeitskontexts.
 * @param filter Aktiver Reviewfilter.
 * @returns Nach Dringlichkeit sortierte Kandidaten.
 */
export function sichtbareReviewKandidaten(kandidaten: ReviewKandidat[], filter: ReviewFilter): ReviewKandidat[] {
  return kandidaten
    .filter((kandidat: ReviewKandidat) => filter === 'alle' || kandidat.status === filter)
    .sort((a: ReviewKandidat, b: ReviewKandidat) => reviewSortierwert(b) - reviewSortierwert(a));
}

/**
 * Ermittelt den aktuell anzuzeigenden Reviewkandidaten.
 *
 * @param sichtbareKandidaten Gefilterte Kandidaten der Warteschlange.
 * @param alleKandidaten Kandidaten des aktiven Arbeitskontexts.
 * @param aktiverKandidatId Aktuell ausgewählte Kandidaten-ID.
 * @returns Aktiver Kandidat oder `null`, wenn keine Kandidaten vorhanden sind.
 */
export function aktiverReviewKandidat(sichtbareKandidaten: ReviewKandidat[], alleKandidaten: ReviewKandidat[], aktiverKandidatId: string): ReviewKandidat | null {
  return sichtbareKandidaten.find((kandidat: ReviewKandidat) => kandidat.id === aktiverKandidatId) ?? sichtbareKandidaten[0] ?? alleKandidaten[0] ?? null;
}

/**
 * Erzeugt die CSS-Statusklasse für Review- und Checkstatus.
 *
 * @param status Fachlicher Status.
 * @returns CSS-Klasse im Format `is-<status>`.
 */
export function reviewStatusKlasse(status: ReviewStatus | ReviewCheckStatus): string {
  return `is-${status}`;
}

/**
 * Liefert die lesbare Bezeichnung eines Reviewstatus.
 *
 * @param status Status des Reviewkandidaten.
 * @returns Statusbezeichnung in Versalien.
 */
export function reviewStatusLabel(status: ReviewStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Liefert die lesbare Bezeichnung der Extraktionsquelle.
 *
 * @param kandidat Reviewkandidat mit Quellenangabe.
 * @returns Lesbares Quellenlabel.
 */
export function reviewQuelleLabel(kandidat: ReviewKandidat): string {
  return QUELLEN_LABELS[kandidat.quelle];
}

/**
 * Formatiert den korrigierten Messwert mit Einheit.
 *
 * @param kandidat Reviewkandidat mit korrigiertem Wert und Einheit.
 * @returns Deutsch formatierter Messwert.
 */
export function korrigierterReviewMesswert(kandidat: ReviewKandidat): string {
  return `${formatiereReviewZahl(kandidat.korrigierterWert)} ${kandidat.korrigierteEinheit}`;
}

/**
 * Berechnet den prozentualen Abschluss des Reviewkontexts.
 *
 * @param kandidaten Kandidaten des aktiven Arbeitskontexts.
 * @returns Ganzzahliger Fortschritt zwischen 0 und 100.
 */
export function reviewFortschritt(kandidaten: ReviewKandidat[]): number {
  const abgeschlossen: number = kandidaten.filter((kandidat: ReviewKandidat) => kandidat.status === 'bestaetigt' || kandidat.status === 'korrigiert' || kandidat.status === 'verworfen').length; // Abgeschlossene Reviewkandidaten.

  return Math.round((abgeschlossen / Math.max(kandidaten.length, 1)) * 100);
}

/**
 * Ermittelt den nächsten offenen oder blockierten Kandidaten.
 *
 * @param kandidaten Kandidaten des aktiven Arbeitskontexts.
 * @param aktuellerId ID des aktuell bearbeiteten Kandidaten.
 * @returns Nächster Kandidat nach Dringlichkeit oder `null`.
 */
export function naechsterOffenerReviewKandidat(kandidaten: ReviewKandidat[], aktuellerId: string): ReviewKandidat | null {
  return kandidaten
    .filter((kandidat: ReviewKandidat) => kandidat.id !== aktuellerId && (kandidat.status === 'offen' || kandidat.status === 'blockiert'))
    .sort((a: ReviewKandidat, b: ReviewKandidat) => reviewSortierwert(b) - reviewSortierwert(a))[0] ?? null;
}

/**
 * Erstellt einen tiefen Klon des Reviewzustands für lokale Bearbeitungen.
 *
 * @param ansicht Von der API gelieferter Reviewzustand.
 * @returns Unabhängiger Reviewzustand mit geklonten Arrays und Checks.
 */
export function kloneReviewAnsicht(ansicht: ReviewViewModel): ReviewViewModel {
  return {
    kandidaten: ansicht.kandidaten.map((kandidat: ReviewKandidat) => ({
      ...kandidat,
      parserHinweise: [...kandidat.parserHinweise],
      checks: kandidat.checks.map((check) => ({ ...check }))
    }))
  };
}

/**
 * Zählt Kandidaten mit einem bestimmten Reviewstatus.
 *
 * @param kandidaten Zu prüfende Kandidaten.
 * @param status Gesuchter Reviewstatus.
 * @returns Anzahl der passenden Kandidaten.
 */
function reviewStatusAnzahl(kandidaten: ReviewKandidat[], status: ReviewStatus): number {
  return kandidaten.filter((kandidat: ReviewKandidat) => kandidat.status === status).length;
}

/**
 * Berechnet einen Sortierwert für die Reviewdringlichkeit.
 *
 * @param kandidat Zu bewertender Reviewkandidat.
 * @returns Numerischer Dringlichkeitswert.
 */
function reviewSortierwert(kandidat: ReviewKandidat): number {
  const statusWert: number = kandidat.status === 'offen' ? 80 : kandidat.status === 'blockiert' ? 70 : 0; // Gewicht des Reviewstatus.
  const confidenceWert: number = 100 - kandidat.confidence;                                              // Gewicht niedriger Confidence.
  const quellenWert: number = kandidat.quelle === 'ocr' ? 35 : 0;                                       // Zusatzgewicht für OCR-Kandidaten.

  return statusWert + confidenceWert + quellenWert;
}

/**
 * Formatiert einen numerischen Laborwert mit deutschem Dezimaltrennzeichen.
 *
 * @param wert Zu formatierender Zahlenwert.
 * @returns Ganzzahl oder Wert mit einer Nachkommastelle.
 */
function formatiereReviewZahl(wert: number): string {
  return Number.isInteger(wert) ? `${wert}` : wert.toFixed(1).replace('.', ',');
}
