/* src/app/core/mocks/laborwerte.mock.ts */

/**
 * @file Mockdaten für normalisierte Laborwerte.
 * @module LaborwerteMock
 */

import { DashboardTrend, Laborwert, LaborwertGruppe } from '../models/laborwert.model';

/** Beispielhafte Laborwerte für Dashboard, Review und Bericht. */
export const MOCK_LABORWERTE: Laborwert[] = [
  {
    id: 'lab-hb-001',
    key: 'haemoglobin',
    name: 'Hämoglobin',
    gruppe: 'Blutbild',
    wert: 14.2,
    einheit: 'g/dl',
    referenzMin: 13.5,
    referenzMax: 17.5,
    status: 'normal',
    prioritaet: 'niedrig',
    confidence: 98,
    trend: [13.9, 14.0, 14.4, 14.2, 14.2],
    hinweis: 'Im Referenzbereich und stabil im Verlauf.'
  },
  {
    id: 'lab-crp-001',
    key: 'crp',
    name: 'CRP',
    gruppe: 'Entzündung',
    wert: 8.6,
    einheit: 'mg/l',
    referenzMin: 0,
    referenzMax: 5,
    status: 'hoch',
    prioritaet: 'hoch',
    confidence: 91,
    trend: [2.1, 3.4, 4.8, 6.7, 8.6],
    hinweis: 'Oberhalb des Referenzbereichs und im Verlauf ansteigend.'
  },
  {
    id: 'lab-ferritin-001',
    key: 'ferritin',
    name: 'Ferritin',
    gruppe: 'Eisenstoffwechsel',
    wert: 28,
    einheit: 'µg/l',
    referenzMin: 30,
    referenzMax: 400,
    status: 'niedrig',
    prioritaet: 'mittel',
    confidence: 87,
    trend: [44, 39, 35, 31, 28],
    hinweis: 'Leicht unterhalb des Referenzbereichs.'
  },
  {
    id: 'lab-vitd-001',
    key: 'vitamin_d',
    name: 'Vitamin D',
    gruppe: 'Vitamine',
    wert: 22,
    einheit: 'ng/ml',
    referenzMin: 30,
    referenzMax: 100,
    status: 'review',
    prioritaet: 'mittel',
    confidence: 62,
    trend: [18, 21, 19, 23, 22],
    hinweis: 'Wert erkannt, Einheit und Referenzbereich müssen geprüft werden.'
  },
  {
    id: 'lab-tsh-001',
    key: 'tsh',
    name: 'TSH',
    gruppe: 'Schilddrüse',
    wert: 2.1,
    einheit: 'mIU/l',
    referenzMin: 0.4,
    referenzMax: 4.0,
    status: 'normal',
    prioritaet: 'niedrig',
    confidence: 96,
    trend: [1.9, 2.2, 2.0, 2.1, 2.1],
    hinweis: 'Unauffällig im Referenzbereich.'
  }
];

/** Gruppierte Zusammenfassung für Dashboard-Karten. */
export const MOCK_LABORWERT_GRUPPEN: LaborwertGruppe[] = [
  { key: 'blutbild', name: 'Blutbild', normal: 12, auffaellig: 0, review: 1 },
  { key: 'entzuendung', name: 'Entzündung', normal: 2, auffaellig: 1, review: 0 },
  { key: 'stoffwechsel', name: 'Stoffwechsel', normal: 8, auffaellig: 2, review: 2 },
  { key: 'schilddruese', name: 'Schilddrüse', normal: 4, auffaellig: 0, review: 0 }
];

/** Trenddaten für große SVG-Grafiken im Dashboard. */
export const MOCK_DASHBOARD_TRENDS: DashboardTrend[] = [
  { key: 'crp', name: 'CRP Verlauf', einheit: 'mg/l', werte: [2.1, 3.4, 4.8, 6.7, 8.6], referenzMin: 0, referenzMax: 5 },
  { key: 'ferritin', name: 'Ferritin Verlauf', einheit: 'µg/l', werte: [44, 39, 35, 31, 28], referenzMin: 30, referenzMax: 400 },
  { key: 'vitamin_d', name: 'Vitamin D Verlauf', einheit: 'ng/ml', werte: [18, 21, 19, 23, 22], referenzMin: 30, referenzMax: 100 }
];
