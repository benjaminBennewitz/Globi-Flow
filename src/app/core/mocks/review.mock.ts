/* src/app/core/mocks/review.mock.ts */

/**
 * @file Mockdaten für die ärztliche Review-Route.
 * @module ReviewMock
 */

import { ReviewViewModel } from '../models/review.model';

/** API-bereite Mockdaten für `/review`. */
export const MOCK_REVIEW: ReviewViewModel = {
  kandidaten: [
    {
      id: 'review-ldl',
      patientId: 'patient-demo-01',
      befundId: 'befund-demo-001',
      laborwertKey: 'ldl_cholesterin',
      anzeigename: 'LDL-Cholesterin',
      erkannterName: 'LDL Chol.',
      erkannterWert: '168',
      korrigierterWert: 168,
      erkannteEinheit: 'mg/dl',
      korrigierteEinheit: 'mg/dl',
      referenzMin: 0,
      referenzMax: 116,
      originalText: 'LDL Chol.              168 mg/dl          < 116',
      originalLabel: 'Seite 1 · Tabelle Fettstoffwechsel · Zeile 8',
      confidence: 62,
      status: 'offen',
      gruppe: 'Fettstoffwechsel',
      quelle: 'pdf_text',
      kommentar: '',
      parserHinweise: ['Alias wurde unsicher zugeordnet.', 'Referenzbereich als kleiner-als-Wert erkannt.'],
      checks: [
        { id: 'check-ldl-1', titel: 'Einheit', beschreibung: 'mg/dl passt zu LDL-Cholesterin.', status: 'ok' },
        { id: 'check-ldl-2', titel: 'Referenzbereich', beschreibung: 'Obergrenze erkannt, Untergrenze wurde ergänzt.', status: 'pruefen' },
        { id: 'check-ldl-3', titel: 'Status', beschreibung: 'Wert liegt oberhalb des Referenzbereichs.', status: 'ok' }
      ]
    },
    {
      id: 'review-vitd',
      patientId: 'patient-demo-01',
      befundId: 'befund-demo-001',
      laborwertKey: 'vitamin_d',
      anzeigename: 'Vitamin D',
      erkannterName: '25-OH-Vit. D',
      erkannterWert: '22',
      korrigierterWert: 22,
      erkannteEinheit: 'ng/ml',
      korrigierteEinheit: 'ng/ml',
      referenzMin: 30,
      referenzMax: 100,
      originalText: '25-OH-Vit. D           22 ng/ml           30 - 100',
      originalLabel: 'Seite 2 · Tabelle Vitamine · Zeile 4',
      confidence: 58,
      status: 'offen',
      gruppe: 'Vitamine',
      quelle: 'pdf_text',
      kommentar: '',
      parserHinweise: ['Laborwert-Key benötigt Review.', 'Wert ist auffällig und Confidence niedrig.'],
      checks: [
        { id: 'check-vitd-1', titel: 'Einheit', beschreibung: 'Einheit ist plausibel.', status: 'ok' },
        { id: 'check-vitd-2', titel: 'Alias', beschreibung: 'Alias-Zuordnung muss bestätigt werden.', status: 'pruefen' },
        { id: 'check-vitd-3', titel: 'Referenz', beschreibung: 'Referenzbereich vollständig erkannt.', status: 'ok' }
      ]
    },
    {
      id: 'review-crp',
      patientId: 'patient-demo-01',
      befundId: 'befund-demo-001',
      laborwertKey: 'crp',
      anzeigename: 'CRP',
      erkannterName: 'CRP',
      erkannterWert: '8.6',
      korrigierterWert: 8.6,
      erkannteEinheit: 'mg/l',
      korrigierteEinheit: 'mg/l',
      referenzMin: 0,
      referenzMax: 5,
      originalText: 'CRP                    8.6 mg/l           < 5.0',
      originalLabel: 'Seite 1 · Tabelle Entzündung · Zeile 2',
      confidence: 91,
      status: 'bestaetigt',
      gruppe: 'Entzündung',
      quelle: 'pdf_text',
      kommentar: 'Automatisch plausibel, ärztlich bestätigt.',
      parserHinweise: ['Stark auffälliger Wert, aber gute Confidence.'],
      checks: [
        { id: 'check-crp-1', titel: 'Einheit', beschreibung: 'mg/l passt zu CRP.', status: 'ok' },
        { id: 'check-crp-2', titel: 'Referenz', beschreibung: 'Obergrenze wurde erkannt.', status: 'ok' },
        { id: 'check-crp-3', titel: 'Vorwert', beschreibung: 'Vorwert vorhanden, Anstieg plausibel.', status: 'ok' }
      ]
    },
    {
      id: 'review-ferritin',
      patientId: 'patient-demo-02',
      befundId: 'befund-demo-002',
      laborwertKey: 'ferritin',
      anzeigename: 'Ferritin',
      erkannterName: 'Ferr.',
      erkannterWert: '28',
      korrigierterWert: 28,
      erkannteEinheit: 'µg/l',
      korrigierteEinheit: 'µg/l',
      referenzMin: 30,
      referenzMax: 400,
      originalText: 'Ferr.                  28 µg/l            30 - 400',
      originalLabel: 'Seite 1 · Tabelle Eisenstoffwechsel · Zeile 5',
      confidence: 74,
      status: 'korrigiert',
      gruppe: 'Eisenstoffwechsel',
      quelle: 'pdf_text',
      kommentar: 'Name wurde zu Ferritin normalisiert.',
      parserHinweise: ['Abkürzung wurde erkannt.', 'Leicht unter Referenzbereich.'],
      checks: [
        { id: 'check-fer-1', titel: 'Alias', beschreibung: 'Ferr. wurde Ferritin zugeordnet.', status: 'ok' },
        { id: 'check-fer-2', titel: 'Einheit', beschreibung: 'Einheit ist plausibel.', status: 'ok' },
        { id: 'check-fer-3', titel: 'Referenz', beschreibung: 'Referenzbereich vollständig erkannt.', status: 'ok' }
      ]
    },
    {
      id: 'review-ocr-hb',
      patientId: 'patient-demo-03',
      befundId: 'befund-demo-003',
      laborwertKey: 'haemoglobin',
      anzeigename: 'Hämoglobin',
      erkannterName: 'Hb',
      erkannterWert: '14,2',
      korrigierterWert: 14.2,
      erkannteEinheit: 'g/dl',
      korrigierteEinheit: 'g/dl',
      referenzMin: 13.5,
      referenzMax: 17.5,
      originalText: 'Hb                     14,2 g/dl          13,5 - 17,5',
      originalLabel: 'Seite 1 · OCR-Ausschnitt · Zeile 3',
      confidence: 49,
      status: 'blockiert',
      gruppe: 'Blutbild',
      quelle: 'ocr',
      kommentar: 'OCR-Komma und Tabellenkante prüfen.',
      parserHinweise: ['OCR-Quelle mit niedriger Confidence.', 'Zahlenformat wurde normalisiert.'],
      checks: [
        { id: 'check-hb-1', titel: 'OCR', beschreibung: 'Originalausschnitt muss geprüft werden.', status: 'konflikt' },
        { id: 'check-hb-2', titel: 'Einheit', beschreibung: 'Einheit ist plausibel.', status: 'ok' },
        { id: 'check-hb-3', titel: 'Zahlenformat', beschreibung: 'Komma wurde zu Dezimalpunkt normalisiert.', status: 'pruefen' }
      ]
    }
  ]
};
