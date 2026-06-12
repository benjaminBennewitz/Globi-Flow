/* src/app/core/mocks/importjobs.mock.ts */

/**
 * @file Mockdaten für Importjobs.
 * @module ImportjobsMock
 */

import { Importjob } from '../models/importjob.model';

/** Wiederverwendbare Pipeline für abgeschlossene Importjobs. */
const ABGESCHLOSSENE_PIPELINE = [
  { key: 'upload', name: 'Upload geprüft', beschreibung: 'Datei wurde validiert und lokal gespeichert.', status: 'erledigt' as const, abgeschlossen: true },
  { key: 'text', name: 'Textschicht gelesen', beschreibung: 'PDF-Textschicht wurde lokal extrahiert.', status: 'erledigt' as const, abgeschlossen: true },
  { key: 'ocr', name: 'OCR-Fallback geprüft', beschreibung: 'OCR war für diesen Befund nicht erforderlich.', status: 'uebersprungen' as const, abgeschlossen: true },
  { key: 'table', name: 'Tabellen erkannt', beschreibung: 'Tabellenstruktur wurde für die Extraktion vorbereitet.', status: 'erledigt' as const, abgeschlossen: true },
  { key: 'values', name: 'Werte extrahiert', beschreibung: 'Laborwerte, Einheiten und Referenzen wurden erkannt.', status: 'erledigt' as const, abgeschlossen: true },
  { key: 'confidence', name: 'Confidence berechnet', beschreibung: 'Unsichere Werte wurden für Review markiert.', status: 'erledigt' as const, abgeschlossen: true }
];

/** Beispielhafte Importjobs für den API-bereiten Frontend-Prototyp. */
export const MOCK_IMPORTJOBS: Importjob[] = [
  {
    id: 'import-demo-001',
    dateiname: 'testdaten-laborbefund-optimiert.pdf',
    testperson: 'Demo Testperson',
    analyseArt: 'demo',
    status: 'review',
    fortschritt: 100,
    pipelineSchritt: 'Review vorbereitet',
    ocrStatus: 'nicht_erforderlich',
    erkannteWerte: 42,
    unsichereWerte: 5,
    confidence: 91,
    erstelltAm: '12.06.2026 · 10:18',
    aktualisiertAm: '12.06.2026 · 10:43',
    schritte: ABGESCHLOSSENE_PIPELINE,
    datasets: [
      { id: 'dataset-blutbild', name: 'Blutbild', werte: 11, review: 1, confidence: 96, status: 'review' },
      { id: 'dataset-leber', name: 'Leberwerte', werte: 7, review: 0, confidence: 94, status: 'normal' },
      { id: 'dataset-niere', name: 'Nierenwerte', werte: 6, review: 1, confidence: 88, status: 'review' },
      { id: 'dataset-fett', name: 'Fettstoffwechsel', werte: 8, review: 2, confidence: 84, status: 'review' },
      { id: 'dataset-vitamine', name: 'Vitamine', werte: 5, review: 1, confidence: 79, status: 'review' }
    ],
    logEintraege: [
      { id: 'log-001-1', zeitpunkt: '10:18', titel: 'Upload validiert', beschreibung: 'PDF wurde lokal angenommen.', status: 'abgeschlossen' },
      { id: 'log-001-2', zeitpunkt: '10:23', titel: 'Textschicht extrahiert', beschreibung: 'Optimierte Testdaten konnten ohne OCR gelesen werden.', status: 'abgeschlossen' },
      { id: 'log-001-3', zeitpunkt: '10:36', titel: '42 Werte erkannt', beschreibung: '5 Werte wurden für den Review markiert.', status: 'review' }
    ]
  },
  {
    id: 'import-demo-002',
    dateiname: 'befund-verlauf-demo-q2.pdf',
    testperson: 'Testperson 12',
    analyseArt: 'textschicht',
    status: 'analysiert',
    fortschritt: 68,
    pipelineSchritt: 'Tabellenstruktur erkennen',
    ocrStatus: 'nicht_erforderlich',
    erkannteWerte: 31,
    unsichereWerte: 6,
    confidence: 84,
    erstelltAm: '12.06.2026 · 10:05',
    aktualisiertAm: '12.06.2026 · 10:31',
    schritte: [
      { key: 'upload', name: 'Upload geprüft', beschreibung: 'Datei wurde validiert und lokal gespeichert.', status: 'erledigt', abgeschlossen: true },
      { key: 'text', name: 'Textschicht gelesen', beschreibung: 'PDF-Textschicht wurde lokal extrahiert.', status: 'erledigt', abgeschlossen: true },
      { key: 'ocr', name: 'OCR-Fallback geprüft', beschreibung: 'OCR war für diesen Befund nicht erforderlich.', status: 'uebersprungen', abgeschlossen: true },
      { key: 'table', name: 'Tabellen erkennen', beschreibung: 'Tabellenstruktur wird aktuell normalisiert.', status: 'aktiv', abgeschlossen: false },
      { key: 'values', name: 'Werte extrahieren', beschreibung: 'Laborwerte werden nach Tabellenanalyse extrahiert.', status: 'wartet', abgeschlossen: false },
      { key: 'confidence', name: 'Confidence berechnen', beschreibung: 'Confidence wird nach Wertnormalisierung berechnet.', status: 'wartet', abgeschlossen: false }
    ],
    datasets: [
      { id: 'dataset-blutbild-2', name: 'Blutbild', werte: 9, review: 2, confidence: 88, status: 'review' },
      { id: 'dataset-stoffwechsel-2', name: 'Stoffwechsel', werte: 6, review: 1, confidence: 82, status: 'review' },
      { id: 'dataset-niere-2', name: 'Nierenwerte', werte: 5, review: 0, confidence: 90, status: 'normal' }
    ],
    logEintraege: [
      { id: 'log-002-1', zeitpunkt: '10:05', titel: 'Upload validiert', beschreibung: 'Datei wurde lokal gespeichert.', status: 'abgeschlossen' },
      { id: 'log-002-2', zeitpunkt: '10:12', titel: 'Textschicht gelesen', beschreibung: 'PDF enthält eine auswertbare Textschicht.', status: 'abgeschlossen' },
      { id: 'log-002-3', zeitpunkt: '10:31', titel: 'Tabellenanalyse aktiv', beschreibung: 'Spalten und Referenzbereiche werden zugeordnet.', status: 'analysiert' }
    ]
  },
  {
    id: 'import-demo-003',
    dateiname: 'scan-laborbefund-ocr-demo.pdf',
    testperson: 'Testperson OCR',
    analyseArt: 'ocr',
    status: 'review',
    fortschritt: 100,
    pipelineSchritt: 'OCR-Review erforderlich',
    ocrStatus: 'abgeschlossen',
    erkannteWerte: 26,
    unsichereWerte: 9,
    confidence: 71,
    erstelltAm: '11.06.2026 · 16:40',
    aktualisiertAm: '11.06.2026 · 17:08',
    schritte: [
      { key: 'upload', name: 'Upload geprüft', beschreibung: 'Datei wurde validiert und lokal gespeichert.', status: 'erledigt', abgeschlossen: true },
      { key: 'text', name: 'Textschicht geprüft', beschreibung: 'Keine brauchbare Textschicht gefunden.', status: 'uebersprungen', abgeschlossen: true },
      { key: 'ocr', name: 'Lokale OCR ausgeführt', beschreibung: 'Bildbasierte Seiten wurden lokal erkannt.', status: 'erledigt', abgeschlossen: true },
      { key: 'table', name: 'Tabellen erkannt', beschreibung: 'Tabellenstruktur wurde aus OCR-Text abgeleitet.', status: 'erledigt', abgeschlossen: true },
      { key: 'values', name: 'Werte extrahiert', beschreibung: 'Mehrere Einheiten müssen geprüft werden.', status: 'erledigt', abgeschlossen: true },
      { key: 'confidence', name: 'Confidence berechnet', beschreibung: '9 Werte wurden wegen niedriger Confidence markiert.', status: 'erledigt', abgeschlossen: true }
    ],
    datasets: [
      { id: 'dataset-ocr-blut', name: 'Blutbild', werte: 8, review: 3, confidence: 72, status: 'review' },
      { id: 'dataset-ocr-leber', name: 'Leberwerte', werte: 6, review: 1, confidence: 78, status: 'review' },
      { id: 'dataset-ocr-vitamine', name: 'Vitamine', werte: 4, review: 3, confidence: 61, status: 'review' }
    ],
    logEintraege: [
      { id: 'log-003-1', zeitpunkt: '16:40', titel: 'Upload validiert', beschreibung: 'Scan-PDF wurde lokal gespeichert.', status: 'abgeschlossen' },
      { id: 'log-003-2', zeitpunkt: '16:43', titel: 'OCR gestartet', beschreibung: 'Lokale OCR-Pipeline wurde verwendet.', status: 'analysiert' },
      { id: 'log-003-3', zeitpunkt: '17:08', titel: 'Review erforderlich', beschreibung: '9 Werte liegen unter der Confidence-Schwelle.', status: 'review' }
    ]
  },
  {
    id: 'import-demo-004',
    dateiname: 'manuell-erfasster-befund.pdf',
    testperson: 'Testperson Fallback',
    analyseArt: 'textschicht',
    status: 'fehler',
    fortschritt: 36,
    pipelineSchritt: 'Parser blockiert',
    ocrStatus: 'erforderlich',
    erkannteWerte: 0,
    unsichereWerte: 0,
    confidence: 0,
    erstelltAm: '10.06.2026 · 09:30',
    aktualisiertAm: '10.06.2026 · 09:42',
    fehlermeldung: 'Tabellenstruktur konnte nicht zuverlässig erkannt werden.',
    schritte: [
      { key: 'upload', name: 'Upload geprüft', beschreibung: 'Datei wurde validiert und lokal gespeichert.', status: 'erledigt', abgeschlossen: true },
      { key: 'text', name: 'Textschicht geprüft', beschreibung: 'Textschicht ist unvollständig.', status: 'fehler', abgeschlossen: false },
      { key: 'ocr', name: 'OCR erforderlich', beschreibung: 'Lokale OCR sollte erneut gestartet werden.', status: 'wartet', abgeschlossen: false },
      { key: 'table', name: 'Tabellen erkennen', beschreibung: 'Tabellenanalyse wartet auf OCR-Ergebnis.', status: 'wartet', abgeschlossen: false },
      { key: 'values', name: 'Werte extrahieren', beschreibung: 'Keine Werte extrahiert.', status: 'wartet', abgeschlossen: false },
      { key: 'confidence', name: 'Confidence berechnen', beschreibung: 'Keine Confidence berechnet.', status: 'wartet', abgeschlossen: false }
    ],
    datasets: [],
    logEintraege: [
      { id: 'log-004-1', zeitpunkt: '09:30', titel: 'Upload validiert', beschreibung: 'PDF wurde lokal angenommen.', status: 'abgeschlossen' },
      { id: 'log-004-2', zeitpunkt: '09:42', titel: 'Parser blockiert', beschreibung: 'Tabellenstruktur konnte nicht erkannt werden.', status: 'fehler' }
    ]
  }
];
