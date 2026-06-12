/* src/app/core/mocks/auswertung.mock.ts */

/**
 * @file Mockdaten für die fachliche Auswertungsroute.
 * @module AuswertungMock
 */

import { AuswertungViewModel } from '../models/auswertung.model';

/** API-bereite Mockdaten für `/auswertung`. */
export const MOCK_AUSWERTUNG: AuswertungViewModel = {
  aktuellerBefund: '12.06.2026',
  vergleichsBefund: '14.03.2026',
  zeitraum: '12 Monate',
  werte: [
    {
      id: 'auswertung-ldl',
      key: 'ldl_cholesterin',
      name: 'LDL-Cholesterin',
      gruppe: 'Fettstoffwechsel',
      wert: 168,
      vorherigerWert: 150,
      einheit: 'mg/dl',
      referenzMin: 0,
      referenzMax: 116,
      status: 'hoch',
      prioritaet: 'hoch',
      reviewStatus: 'geprueft',
      confidence: 92,
      veraenderungAbsolut: 18,
      veraenderungProzent: 12,
      abweichungProzent: 45,
      trend: 'steigend',
      hinweis: 'Oberhalb des Referenzbereichs und im Vergleich weiter ansteigend.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 128 },
        { label: 'Sep', datum: '2025-09-21', wert: 136 },
        { label: 'Nov', datum: '2025-11-12', wert: 141 },
        { label: 'Mär', datum: '2026-03-14', wert: 150 },
        { label: 'Jun', datum: '2026-06-12', wert: 168 }
      ]
    },
    {
      id: 'auswertung-crp',
      key: 'crp',
      name: 'CRP',
      gruppe: 'Entzündung',
      wert: 8.6,
      vorherigerWert: 4.8,
      einheit: 'mg/l',
      referenzMin: 0,
      referenzMax: 5,
      status: 'hoch',
      prioritaet: 'hoch',
      reviewStatus: 'geprueft',
      confidence: 91,
      veraenderungAbsolut: 3.8,
      veraenderungProzent: 79,
      abweichungProzent: 72,
      trend: 'steigend',
      hinweis: 'Erhöht und im Verlauf deutlich steigend. Ärztliche Einordnung erforderlich.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 2.1 },
        { label: 'Sep', datum: '2025-09-21', wert: 3.4 },
        { label: 'Nov', datum: '2025-11-12', wert: 4.1 },
        { label: 'Mär', datum: '2026-03-14', wert: 4.8 },
        { label: 'Jun', datum: '2026-06-12', wert: 8.6 }
      ]
    },
    {
      id: 'auswertung-ferritin',
      key: 'ferritin',
      name: 'Ferritin',
      gruppe: 'Eisenstoffwechsel',
      wert: 28,
      vorherigerWert: 35,
      einheit: 'µg/l',
      referenzMin: 30,
      referenzMax: 400,
      status: 'niedrig',
      prioritaet: 'mittel',
      reviewStatus: 'geprueft',
      confidence: 87,
      veraenderungAbsolut: -7,
      veraenderungProzent: -20,
      abweichungProzent: 7,
      trend: 'fallend',
      hinweis: 'Leicht unterhalb des Referenzbereichs und im Verlauf fallend.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 52 },
        { label: 'Sep', datum: '2025-09-21', wert: 44 },
        { label: 'Nov', datum: '2025-11-12', wert: 39 },
        { label: 'Mär', datum: '2026-03-14', wert: 35 },
        { label: 'Jun', datum: '2026-06-12', wert: 28 }
      ]
    },
    {
      id: 'auswertung-vitd',
      key: 'vitamin_d',
      name: 'Vitamin D',
      gruppe: 'Vitamine',
      wert: 22,
      vorherigerWert: 23,
      einheit: 'ng/ml',
      referenzMin: 30,
      referenzMax: 100,
      status: 'review',
      prioritaet: 'mittel',
      reviewStatus: 'review',
      confidence: 62,
      veraenderungAbsolut: -1,
      veraenderungProzent: -4,
      abweichungProzent: 27,
      trend: 'stabil',
      hinweis: 'Wert und Einheit müssen wegen niedriger Confidence im Review geprüft werden.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 18 },
        { label: 'Sep', datum: '2025-09-21', wert: 21 },
        { label: 'Nov', datum: '2025-11-12', wert: 19 },
        { label: 'Mär', datum: '2026-03-14', wert: 23 },
        { label: 'Jun', datum: '2026-06-12', wert: 22 }
      ]
    },
    {
      id: 'auswertung-hb',
      key: 'haemoglobin',
      name: 'Hämoglobin',
      gruppe: 'Blutbild',
      wert: 14.2,
      vorherigerWert: 14.4,
      einheit: 'g/dl',
      referenzMin: 13.5,
      referenzMax: 17.5,
      status: 'normal',
      prioritaet: 'niedrig',
      reviewStatus: 'geprueft',
      confidence: 98,
      veraenderungAbsolut: -0.2,
      veraenderungProzent: -1,
      abweichungProzent: 0,
      trend: 'stabil',
      hinweis: 'Im Referenzbereich und ohne relevante Veränderung.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 13.9 },
        { label: 'Sep', datum: '2025-09-21', wert: 14.0 },
        { label: 'Nov', datum: '2025-11-12', wert: 14.4 },
        { label: 'Mär', datum: '2026-03-14', wert: 14.4 },
        { label: 'Jun', datum: '2026-06-12', wert: 14.2 }
      ]
    },
    {
      id: 'auswertung-tsh',
      key: 'tsh',
      name: 'TSH',
      gruppe: 'Schilddrüse',
      wert: 2.1,
      vorherigerWert: 2.0,
      einheit: 'mIU/l',
      referenzMin: 0.4,
      referenzMax: 4.0,
      status: 'normal',
      prioritaet: 'niedrig',
      reviewStatus: 'geprueft',
      confidence: 96,
      veraenderungAbsolut: 0.1,
      veraenderungProzent: 5,
      abweichungProzent: 0,
      trend: 'stabil',
      hinweis: 'Unauffällig im Referenzbereich.',
      verlauf: [
        { label: 'Jul', datum: '2025-07-18', wert: 1.9 },
        { label: 'Sep', datum: '2025-09-21', wert: 2.2 },
        { label: 'Nov', datum: '2025-11-12', wert: 2.0 },
        { label: 'Mär', datum: '2026-03-14', wert: 2.0 },
        { label: 'Jun', datum: '2026-06-12', wert: 2.1 }
      ]
    }
  ],
  gruppen: [
    { key: 'blutbild', name: 'Blutbild', normal: 12, niedrig: 0, hoch: 0, review: 1 },
    { key: 'entzuendung', name: 'Entzündung', normal: 2, niedrig: 0, hoch: 1, review: 0 },
    { key: 'fettstoffwechsel', name: 'Fettstoffwechsel', normal: 5, niedrig: 0, hoch: 2, review: 1 },
    { key: 'eisenstoffwechsel', name: 'Eisenstoffwechsel', normal: 3, niedrig: 1, hoch: 0, review: 0 },
    { key: 'vitamine', name: 'Vitamine', normal: 2, niedrig: 0, hoch: 0, review: 2 },
    { key: 'schilddruese', name: 'Schilddrüse', normal: 4, niedrig: 0, hoch: 0, review: 0 }
  ]
};
