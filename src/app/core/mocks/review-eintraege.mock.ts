/* src/app/core/mocks/review-eintraege.mock.ts */

/**
 * @file Mockdaten für ärztliche Review-Einträge.
 * @module ReviewEintraegeMock
 */

import { ReviewEintrag } from '../models/review-eintrag.model';

/** Beispielhafte Review-Einträge für unsichere Befunddaten. */
export const MOCK_REVIEW_EINTRAEGE: ReviewEintrag[] = [
  {
    id: 'review-vitd-unit',
    laborwertKey: 'vitamin_d',
    laborwertName: 'Vitamin D',
    confidence: 62,
    feld: 'einheit',
    originalText: '25-OH Vitamin D 22 ng/ml Ref. 30 - 100',
    erkannterWert: '22 ng/ml',
    vorschlag: '22 ng/ml',
    grund: 'Einheit wurde erkannt, aber die Referenzspalte war optisch nah an der Ergebnisspalte.'
  },
  {
    id: 'review-ferritin-ref',
    laborwertKey: 'ferritin',
    laborwertName: 'Ferritin',
    confidence: 74,
    feld: 'referenzbereich',
    originalText: 'Ferritin 28 µg/l 30-400',
    erkannterWert: '28 µg/l, Ref. 30-400',
    vorschlag: 'Referenzbereich 30 bis 400 µg/l',
    grund: 'Referenzbereich ohne Leerzeichen erkannt.'
  },
  {
    id: 'review-leuko-value',
    laborwertKey: 'leukozyten',
    laborwertName: 'Leukozyten',
    confidence: 69,
    feld: 'wert',
    originalText: 'Leukozyten 6,8 /nl',
    erkannterWert: '68 /nl',
    vorschlag: '6,8 /nl',
    grund: 'Dezimaltrennzeichen wurde unsicher interpretiert.'
  }
];
