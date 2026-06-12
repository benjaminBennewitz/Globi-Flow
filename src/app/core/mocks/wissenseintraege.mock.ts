/* src/app/core/mocks/wissenseintraege.mock.ts */

/**
 * @file Mockdaten für kontrollierte Wissensinhalte.
 * @module WissenseintraegeMock
 */

import { Wissenseintrag } from '../models/wissenseintrag.model';

/** Beispielhafte Wissenseinträge für Editor und Patientenbericht. */
export const MOCK_WISSENSEINTRAEGE: Wissenseintrag[] = [
  {
    id: 'wissen-crp',
    laborwertKey: 'crp',
    anzeigename: 'CRP',
    kategorie: 'Entzündung',
    patientKurztext: 'CRP ist ein Entzündungswert und kann bei Infekten oder anderen Entzündungsprozessen ansteigen.',
    patientLangtext: 'Ein erhöhter CRP-Wert bedeutet nicht automatisch eine bestimmte Erkrankung. Er zeigt zunächst nur, dass im Körper ein Entzündungsprozess möglich ist.',
    arztinformation: 'Verlauf, Symptome und weitere Werte gemeinsam bewerten.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose.',
    quellen: 'Interne Testquelle, Version für Demo-Daten.',
    version: 1,
    status: 'aktiv'
  },
  {
    id: 'wissen-ferritin',
    laborwertKey: 'ferritin',
    anzeigename: 'Ferritin',
    kategorie: 'Eisenstoffwechsel',
    patientKurztext: 'Ferritin zeigt, wie gut die Eisenspeicher im Körper gefüllt sind.',
    patientLangtext: 'Ein niedriger Ferritinwert kann auf geringe Eisenspeicher hinweisen. Die Einordnung hängt unter anderem von Blutbild, Ernährung, Beschwerden und Entzündungswerten ab.',
    arztinformation: 'Zusammen mit Hämoglobin, MCV, MCH und CRP betrachten.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose.',
    quellen: 'Interne Testquelle, Version für Demo-Daten.',
    version: 1,
    status: 'aktiv'
  }
];
