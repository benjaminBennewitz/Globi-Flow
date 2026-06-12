/* src/app/core/mocks/patientenbericht.mock.ts */

/**
 * @file Mockdaten für eine Patientenbericht-Vorschau.
 * @module PatientenberichtMock
 */

import { Patientenbericht } from '../models/patientenbericht.model';

/** Beispielhafter Patientenbericht mit freigegebenen Testdaten. */
export const MOCK_PATIENTENBERICHT: Patientenbericht = {
  id: 'report-demo-001',
  testperson: 'Testperson Demo',
  berichtsdatum: '12.06.2026',
  zusammenfassung: 'Die meisten Werte liegen im Referenzbereich. Einzelne Werte sollten im Arztgespräch eingeordnet werden, insbesondere CRP, Ferritin und Vitamin D.',
  abschnitte: [
    {
      key: 'auffaellig',
      titel: 'Auffällige Werte',
      text: 'CRP liegt oberhalb des Referenzbereichs. Ferritin liegt leicht darunter. Beide Werte sollten zusammen mit Beschwerden und Verlauf betrachtet werden.'
    },
    {
      key: 'normal',
      titel: 'Unauffällige Werte',
      text: 'Hämoglobin und TSH liegen in dieser Testauswertung im Referenzbereich.'
    },
    {
      key: 'review',
      titel: 'Ärztlich geprüft',
      text: 'Unsichere Werte werden erst nach Kontrolle und Freigabe in den Patientenbericht übernommen.'
    }
  ],
  fragen: [
    { id: 'frage-crp', bereich: 'Entzündung', frage: 'Kann der erhöhte CRP-Wert zu aktuellen Beschwerden oder einem Infekt passen?' },
    { id: 'frage-ferritin', bereich: 'Eisenstoffwechsel', frage: 'Sollten weitere Eisenwerte oder das Blutbild gemeinsam betrachtet werden?' },
    { id: 'frage-vitd', bereich: 'Vitamine', frage: 'Ist der Vitamin-D-Wert korrekt erkannt und medizinisch relevant?' }
  ],
  disclaimer: 'Diese Auswertung dient nur der verständlichen Zusammenfassung freigegebener Testdaten. Sie ersetzt keine Diagnose, Beratung oder Behandlung durch Ärztinnen oder Ärzte.'
};
