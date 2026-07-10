/* src/app/pages/importe-page/importe-page-logik.ts */

/**
 * @file Zustandslose Anzeige-, Filter- und Kennzahlenlogik der Importseite.
 * @module ImportePageLogik
 */

import { Importjob, ImportjobAnalyseArt, ImportjobDataset, ImportjobOcrStatus, ImportjobSchrittStatus, ImportjobStatus } from '../../core/models/importjob.model';

/** Verfügbare Statusgruppen der Importhistorie. */
export type ImportFilter = 'alle' | 'aktiv' | 'review' | 'ocr' | 'fehler' | 'abgeschlossen';

/** Kompakte Kennzahl der Importseite. */
export interface ImportKennzahl {
  label: string;          // Anzeigename der Kennzahl.
  wert: string | number;  // Anzeigenwert der Kennzahl.
  hinweis: string;        // Zusätzlicher Kurztext.
  icon: string;           // Material-Symbol der Kennzahl.
  status?: string;        // Optionale Statusklasse.
}

/** Beschriftete Filteroptionen der Importhistorie. */
export const FILTER_OPTIONEN: { key: ImportFilter; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'aktiv', label: 'Aktiv' },
  { key: 'review', label: 'Review' },
  { key: 'ocr', label: 'OCR' },
  { key: 'fehler', label: 'Fehler' },
  { key: 'abgeschlossen', label: 'Freigegeben' }
];

/**
 * Berechnet die kompakten Statuskennzahlen der Importseite.
 *
 * @param importjobs Aktuell geladene Importjobs.
 * @returns Kennzahlen für aktive, offene und abgeschlossene Verarbeitungen.
 */
export function kennzahlen(importjobs: Importjob[]): ImportKennzahl[] {
  const aktiveJobs = importjobs.filter((job) => importLaeuft(job)).length;                                                        // Anzahl laufender Jobs.
  const reviewJobs = importjobs.filter((job) => job.status === 'review').length;                                                  // Anzahl offener Reviews.
  const ocrJobs = importjobs.filter((job) => job.ocrStatus !== 'nicht_erforderlich').length;                                      // Anzahl OCR-relevanter Jobs.
  const fehlerJobs = importjobs.filter((job) => job.status === 'fehler').length;                                                  // Anzahl fehlgeschlagener Jobs.
  const confidence = aktiveJobs ? 0 : durchschnitt(importjobs.filter((job) => job.confidence > 0).map((job) => job.confidence));  // Gemittelte Erkennungsqualität.

  return [
    { label: 'Aktive Jobs', wert: aktiveJobs, hinweis: aktiveJobs ? 'OCR läuft lokal' : 'keine Warteschlange', icon: aktiveJobs ? 'progress_activity' : 'sync', status: 'info' },
    { label: 'Warten auf Review', wert: reviewJobs, hinweis: 'ärztlich prüfen', icon: 'fact_check', status: 'warning' },
    { label: 'OCR erforderlich', wert: ocrJobs, hinweis: 'lokale OCR-Pipeline', icon: 'document_scanner', status: 'info' },
    { label: 'Fehlerhafte Importe', wert: fehlerJobs, hinweis: 'Retry oder manuell', icon: 'error', status: 'danger' },
    { label: 'Ø Confidence', wert: `${confidence}%`, hinweis: aktiveJobs ? 'wartet auf Ergebnis' : 'erkannte Werte', icon: 'verified', status: 'success' }
  ];
}

/**
 * Filtert Importjobs anhand einer ausgewählten Statusgruppe.
 *
 * @param importjobs Vollständige Importhistorie.
 * @param filter Aktuell ausgewählter Statusfilter.
 * @returns Gefilterte Importjobs in unveränderter Reihenfolge.
 */
export function gefilterteJobs(importjobs: Importjob[], filter: ImportFilter): Importjob[] {
  if (filter === 'aktiv') {
    return importjobs.filter((job) => importLaeuft(job));
  }

  if (filter === 'ocr') {
    return importjobs.filter((job) => job.ocrStatus !== 'nicht_erforderlich');
  }

  if (filter === 'alle') {
    return importjobs;
  }

  return importjobs.filter((job) => job.status === filter);
}

/**
 * Ermittelt den ausgewählten Importjob mit robustem Fallback.
 *
 * @param importjobs Aktuell sichtbare Importjobs.
 * @param ausgewaehlterJobId ID des aktiv ausgewählten Jobs.
 * @returns Ausgewählter Job, erster Eintrag oder null.
 */
export function ausgewaehlterJob(importjobs: Importjob[], ausgewaehlterJobId: string): Importjob | null {
  return importjobs.find((job) => job.id === ausgewaehlterJobId) ?? importjobs[0] ?? null;
}

/**
 * Erzeugt die CSS-Statusklasse eines Importjobs.
 *
 * @param status Fachlicher Importstatus.
 * @returns CSS-Klasse mit Statuspräfix.
 */
export function statusKlasse(status: ImportjobStatus): string {
  return `is-${status}`;
}

/**
 * Erzeugt die CSS-Statusklasse eines Pipeline-Schritts.
 *
 * @param status Status des Verarbeitungsschritts.
 * @returns CSS-Klasse mit Statuspräfix.
 */
export function schrittKlasse(status: ImportjobSchrittStatus): string {
  return `is-${status}`;
}

/**
 * Erzeugt die CSS-Statusklasse einer Dataset-Karte.
 *
 * @param dataset Darzustellendes Import-Dataset.
 * @returns CSS-Klasse passend zum Dataset-Status.
 */
export function datasetKlasse(dataset: ImportjobDataset): string {
  return `is-${dataset.status}`;
}

/**
 * Übersetzt die technische Analyseart in ein UI-Label.
 *
 * @param job Importjob mit Analysemetadaten.
 * @returns Lesbare Bezeichnung der Analyseart.
 */
export function analyseLabel(job: Importjob): string {
  const labels: Record<ImportjobAnalyseArt, string> = {
    textschicht: 'Textschicht',
    ocr: 'Lokale OCR',
    demo: 'Demo'
  };

  return labels[job.analyseArt];
}

/**
 * Übersetzt den technischen OCR-Status in ein UI-Label.
 *
 * @param status Technischer OCR-Status.
 * @returns Lesbare Bezeichnung des OCR-Status.
 */
export function ocrLabel(status: ImportjobOcrStatus): string {
  const labels: Record<ImportjobOcrStatus, string> = {
    nicht_erforderlich: 'Nicht erforderlich',
    erforderlich: 'Erforderlich',
    aktiv: 'Aktiv',
    abgeschlossen: 'Abgeschlossen',
    fehler: 'Fehler'
  };

  return labels[status];
}

/**
 * Prüft, ob ein Importjob noch verarbeitet wird.
 *
 * @param job Zu prüfender Importjob.
 * @returns true bei wartender oder aktiver Analyse.
 */
export function importLaeuft(job: Importjob): boolean {
  return job.status === 'wartet' || job.status === 'analysiert';
}

/**
 * Erstellt einen kontextabhängigen Hinweis für laufende Importjobs.
 *
 * @param job Aktuell verarbeiteter Importjob.
 * @returns Hinweis zur lokalen Hintergrundverarbeitung.
 */
export function laufenderJobHinweis(job: Importjob): string {
  if (job.ocrStatus === 'aktiv' || job.analyseArt === 'ocr') {
    return 'OCR verarbeitet die gescannten PDF-Seiten lokal. Du kannst die Route wechseln; der Job läuft weiter.';
  }

  return 'Die Datei wird lokal analysiert. Du kannst währenddessen in anderen Bereichen weiterarbeiten.';
}

/**
 * Berechnet den gerundeten Durchschnitt einer Zahlenliste.
 *
 * @param werte Zahlenwerte für die Mittelwertbildung.
 * @returns Gerundeter Durchschnitt oder 0 bei leerer Liste.
 */
function durchschnitt(werte: number[]): number {
  if (!werte.length) {
    return 0;
  }

  return Math.round(werte.reduce((summe, wert) => summe + wert, 0) / werte.length);
}
