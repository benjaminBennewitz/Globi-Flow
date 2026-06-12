/* src/app/core/mocks/patienten.mock.ts */

/**
 * @file Mockdaten für zentrale Testpersonen und hinterlegte Befunde.
 * @module PatientenMock
 */

import { Patient } from '../models/patient.model';

/** API-bereite Testpersonen für den globalen Arbeitskontext. */
export const MOCK_PATIENTEN: Patient[] = [
  {
    id: 'patient-demo-01',
    nummer: 'TP-2026-001',
    name: 'Mara Hoffmann',
    vorname: 'Mara',
    nachname: 'Hoffmann',
    geburtsdatum: '1984-04-18',
    geschlecht: 'weiblich',
    gewichtKg: 72,
    groesseCm: 168,
    lebensstil: 'Büroarbeit, moderat aktiv, vegetarische Ernährung',
    kontext: 'optimierte Testdaten',
    quelle: 'demo',
    status: 'review',
    befunde: 5,
    offeneReviews: 5,
    letzterBefund: '12.06.2026',
    berichtStatus: 'Bericht vorbereitet',
    notiz: 'Fiktive Testakte für optimierte PDF-Testdaten.',
    befundListe: [
      { id: 'befund-demo-001', name: 'testdaten-laborbefund-optimiert.pdf', datum: '12.06.2026', status: 'review_offen', werte: 42, offeneReviews: 5 },
      { id: 'befund-demo-001-vorwert', name: 'verlauf-q1-demo.pdf', datum: '14.03.2026', status: 'freigegeben', werte: 39, offeneReviews: 0 },
      { id: 'befund-demo-001-2025', name: 'jahresvergleich-2025.pdf', datum: '18.11.2025', status: 'freigegeben', werte: 37, offeneReviews: 0 }
    ]
  },
  {
    id: 'patient-demo-02',
    nummer: 'TP-2026-002',
    name: 'Jonas Keller',
    vorname: 'Jonas',
    nachname: 'Keller',
    geburtsdatum: '1978-09-03',
    geschlecht: 'maennlich',
    gewichtKg: 86,
    groesseCm: 181,
    lebensstil: 'Schichtarbeit, wenig Bewegung, gemischte Ernährung',
    kontext: 'mehrere Befunde',
    quelle: 'verlauf',
    status: 'bericht',
    befunde: 4,
    offeneReviews: 3,
    letzterBefund: '12.06.2026',
    berichtStatus: 'Bericht offen',
    notiz: 'Fiktive Testakte mit mehreren Vergleichsbefunden.',
    befundListe: [
      { id: 'befund-demo-002', name: 'befund-verlauf-demo-q2.pdf', datum: '12.06.2026', status: 'review_offen', werte: 31, offeneReviews: 3 },
      { id: 'befund-demo-002-vorwert', name: 'befund-verlauf-demo-q1.pdf', datum: '10.03.2026', status: 'freigegeben', werte: 30, offeneReviews: 0 },
      { id: 'befund-demo-002-2025', name: 'verlauf-herbst-2025.pdf', datum: '02.10.2025', status: 'bericht_bereit', werte: 29, offeneReviews: 0 }
    ]
  },
  {
    id: 'patient-demo-03',
    nummer: 'TP-2026-003',
    name: 'Lea Sommer',
    vorname: 'Lea',
    nachname: 'Sommer',
    geburtsdatum: '1991-01-27',
    geschlecht: 'weiblich',
    gewichtKg: 64,
    groesseCm: 172,
    lebensstil: 'sportlich aktiv, unregelmäßige Mahlzeiten',
    kontext: 'Scan-Befund',
    quelle: 'ocr',
    status: 'review',
    befunde: 2,
    offeneReviews: 7,
    letzterBefund: '11.06.2026',
    berichtStatus: 'nicht bereit',
    notiz: 'Fiktive Testakte für bildbasierte OCR-Reviewfälle.',
    befundListe: [
      { id: 'befund-demo-003', name: 'scan-laborbefund-ocr-demo.pdf', datum: '11.06.2026', status: 'ocr_review', werte: 26, offeneReviews: 7 },
      { id: 'befund-demo-003-vorwert', name: 'scan-kontrolle-2025.pdf', datum: '16.12.2025', status: 'freigegeben', werte: 24, offeneReviews: 0 }
    ]
  },
  {
    id: 'patient-demo-04',
    nummer: 'TP-2026-004',
    name: 'Emil Brandt',
    vorname: 'Emil',
    nachname: 'Brandt',
    geburtsdatum: '1968-07-22',
    geschlecht: 'maennlich',
    gewichtKg: 94,
    groesseCm: 176,
    lebensstil: 'wenig Bewegung, Nikotinkarenz, fettbewusste Ernährung',
    kontext: 'Fettstoffwechsel',
    quelle: 'verlauf',
    status: 'bericht',
    befunde: 6,
    offeneReviews: 0,
    letzterBefund: '02.06.2026',
    berichtStatus: 'freigegeben',
    notiz: 'Fiktive Testakte mit Schwerpunkt Lipidverlauf.',
    befundListe: [
      { id: 'befund-demo-004', name: 'lipide-verlauf-demo.pdf', datum: '02.06.2026', status: 'bericht_bereit', werte: 28, offeneReviews: 0 },
      { id: 'befund-demo-004-vorwert', name: 'lipide-kontrolle-q1.pdf', datum: '08.02.2026', status: 'freigegeben', werte: 28, offeneReviews: 0 },
      { id: 'befund-demo-004-2025', name: 'lipide-basis-2025.pdf', datum: '19.09.2025', status: 'freigegeben', werte: 27, offeneReviews: 0 }
    ]
  },
  {
    id: 'patient-demo-05',
    nummer: 'TP-2026-005',
    name: 'Nora Weber',
    vorname: 'Nora',
    nachname: 'Weber',
    geburtsdatum: '2000-12-05',
    geschlecht: 'divers',
    gewichtKg: 69,
    groesseCm: 174,
    lebensstil: 'studentischer Alltag, wechselnde Schlafzeiten',
    kontext: 'Fallback-Eingabe',
    quelle: 'manuell',
    status: 'leer',
    befunde: 0,
    offeneReviews: 0,
    letzterBefund: 'kein Befund',
    berichtStatus: 'keine Daten',
    notiz: 'Fiktive Testakte ohne importierte Befunde.',
    befundListe: []
  }
];
