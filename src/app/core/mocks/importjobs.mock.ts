/* src/app/core/mocks/importjobs.mock.ts */

/**
 * @file Mockdaten für Importjobs.
 * @module ImportjobsMock
 */

import { Importjob } from '../models/importjob.model';

/** Beispielhafte Importjobs für den API-bereiten Frontend-Prototyp. */
export const MOCK_IMPORTJOBS: Importjob[] = [
  {
    id: 'import-demo-001',
    dateiname: 'testdaten-laborbefund-optimiert.pdf',
    analyseArt: 'demo',
    status: 'abgeschlossen',
    fortschritt: 100,
    erkannteWerte: 37,
    unsichereWerte: 4,
    confidence: 94,
    aktualisiertAm: '2026-06-12T09:35:00',
    schritte: [
      { key: 'upload', name: 'Upload', beschreibung: 'Testdaten-PDF wurde bereitgestellt.', abgeschlossen: true },
      { key: 'text', name: 'Textschicht', beschreibung: 'Lokale Textanalyse abgeschlossen.', abgeschlossen: true },
      { key: 'parser', name: 'Parser', beschreibung: 'Laborwerte und Referenzen erkannt.', abgeschlossen: true },
      { key: 'review', name: 'Review', beschreibung: 'Unsichere Werte wurden markiert.', abgeschlossen: true }
    ]
  },
  {
    id: 'import-demo-002',
    dateiname: 'befund-verlauf-demo-q2.pdf',
    analyseArt: 'textschicht',
    status: 'review',
    fortschritt: 82,
    erkannteWerte: 31,
    unsichereWerte: 6,
    confidence: 88,
    aktualisiertAm: '2026-06-12T10:05:00',
    schritte: [
      { key: 'upload', name: 'Upload', beschreibung: 'Datei wurde lokal gespeichert.', abgeschlossen: true },
      { key: 'text', name: 'Textschicht', beschreibung: 'Textschicht wurde extrahiert.', abgeschlossen: true },
      { key: 'parser', name: 'Parser', beschreibung: 'Tabellenstruktur wird normalisiert.', abgeschlossen: true },
      { key: 'review', name: 'Review', beschreibung: 'Ärztliche Prüfung ist offen.', abgeschlossen: false }
    ]
  }
];
