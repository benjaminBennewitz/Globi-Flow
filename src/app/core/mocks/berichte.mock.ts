/* src/app/core/mocks/berichte.mock.ts */

/**
 * @file Mockdaten für druckfertige Patientenberichte.
 * @module BerichteMock
 */

import { BerichtViewModel } from '../models/bericht.model';

/** Druckfertiger Demo-Patientenbericht auf Basis freigegebener Testwerte. */
export const MOCK_BERICHT: BerichtViewModel = {
  id: 'bericht-demo-a4-001',
  berichtsdatum: '12.06.2026',
  version: '1.0',
  gesamtstatus: 'Überwiegend unauffällig mit einzelnen Hinweisen',
  gesamttext: 'Die geprüften Blutwerte zeigen insgesamt ein überwiegend stabiles Bild. Einzelne Werte im Bereich Fettstoffwechsel, Entzündung und Eisenstoffwechsel liegen außerhalb des Referenzbereichs und sollten im Arztgespräch gemeinsam mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
  gepruefteWerte: 42,
  normaleWerte: 35,
  auffaelligeWerte: 5,
  reviewWerte: 2,
  werte: [
    {
      key: 'haemoglobin',
      name: 'Hämoglobin',
      gruppe: 'Blutbild',
      wert: 14.2,
      einheit: 'g/dl',
      referenzMin: 13.5,
      referenzMax: 17.5,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'Hämoglobin ist der rote Blutfarbstoff und hilft dabei, Sauerstoff im Körper zu transportieren.',
      hinweis: 'Der Wert liegt im Referenzbereich und zeigt im Verlauf keine relevante Veränderung.',
      verlauf: [13.9, 14.0, 14.4, 14.4, 14.2]
    },
    {
      key: 'leukozyten',
      name: 'Leukozyten',
      gruppe: 'Blutbild',
      wert: 6.8,
      einheit: 'Tsd./µl',
      referenzMin: 4.0,
      referenzMax: 10.0,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'Leukozyten sind weiße Blutkörperchen und gehören zur körpereigenen Abwehr.',
      hinweis: 'Der Wert liegt im Referenzbereich.',
      verlauf: [6.2, 6.4, 6.5, 6.6, 6.8]
    },
    {
      key: 'crp',
      name: 'CRP',
      gruppe: 'Entzündung',
      wert: 8.6,
      einheit: 'mg/l',
      referenzMin: 0,
      referenzMax: 5,
      status: 'hoch',
      trend: 'steigend',
      erklaerung: 'CRP ist ein Entzündungswert und kann bei Infekten oder anderen Entzündungsprozessen ansteigen.',
      hinweis: 'Der Wert liegt oberhalb des Referenzbereichs und sollte ärztlich im Zusammenhang mit Beschwerden und Verlauf eingeordnet werden.',
      verlauf: [2.1, 3.4, 4.1, 4.8, 8.6]
    },
    {
      key: 'ldl_cholesterin',
      name: 'LDL-Cholesterin',
      gruppe: 'Fettstoffwechsel',
      wert: 168,
      einheit: 'mg/dl',
      referenzMin: 0,
      referenzMax: 116,
      status: 'hoch',
      trend: 'steigend',
      erklaerung: 'LDL-Cholesterin wird häufig im Zusammenhang mit dem Herz-Kreislauf-Risiko betrachtet.',
      hinweis: 'Der Wert liegt oberhalb des Referenzbereichs. Die Bedeutung hängt vom persönlichen Risikoprofil ab.',
      verlauf: [128, 136, 141, 150, 168]
    },
    {
      key: 'glukose',
      name: 'Glukose',
      gruppe: 'Zuckerstoffwechsel',
      wert: 92,
      einheit: 'mg/dl',
      referenzMin: 70,
      referenzMax: 100,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'Glukose ist der Blutzuckerwert und zeigt die aktuelle Zuckerkonzentration im Blut.',
      hinweis: 'Der Wert liegt im Referenzbereich.',
      verlauf: [89, 94, 91, 93, 92]
    },
    {
      key: 'hba1c',
      name: 'HbA1c',
      gruppe: 'Zuckerstoffwechsel',
      wert: 5.4,
      einheit: '%',
      referenzMin: 4.0,
      referenzMax: 5.7,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'HbA1c beschreibt vereinfacht den durchschnittlichen Blutzucker der letzten Wochen.',
      hinweis: 'Der Wert liegt im Referenzbereich.',
      verlauf: [5.3, 5.4, 5.4, 5.5, 5.4]
    },
    {
      key: 'kreatinin',
      name: 'Kreatinin',
      gruppe: 'Nierenfunktion',
      wert: 0.92,
      einheit: 'mg/dl',
      referenzMin: 0.7,
      referenzMax: 1.2,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'Kreatinin wird häufig zur Einschätzung der Nierenfunktion genutzt.',
      hinweis: 'Der Wert liegt im Referenzbereich.',
      verlauf: [0.88, 0.9, 0.91, 0.9, 0.92]
    },
    {
      key: 'ferritin',
      name: 'Ferritin',
      gruppe: 'Eisenstoffwechsel',
      wert: 28,
      einheit: 'µg/l',
      referenzMin: 30,
      referenzMax: 400,
      status: 'niedrig',
      trend: 'fallend',
      erklaerung: 'Ferritin zeigt, wie gut die Eisenspeicher im Körper gefüllt sind.',
      hinweis: 'Der Wert liegt leicht unterhalb des Referenzbereichs und sollte zusammen mit Blutbild und Beschwerden betrachtet werden.',
      verlauf: [52, 44, 39, 35, 28]
    },
    {
      key: 'tsh',
      name: 'TSH',
      gruppe: 'Schilddrüse',
      wert: 2.1,
      einheit: 'mIU/l',
      referenzMin: 0.4,
      referenzMax: 4.0,
      status: 'normal',
      trend: 'stabil',
      erklaerung: 'TSH ist ein Steuerhormon und wird häufig zur Einschätzung der Schilddrüsenfunktion genutzt.',
      hinweis: 'Der Wert liegt im Referenzbereich.',
      verlauf: [1.9, 2.2, 2.0, 2.0, 2.1]
    },
    {
      key: 'vitamin_d',
      name: 'Vitamin D',
      gruppe: 'Vitamine',
      wert: 22,
      einheit: 'ng/ml',
      referenzMin: 30,
      referenzMax: 100,
      status: 'review',
      trend: 'stabil',
      erklaerung: 'Vitamin D ist unter anderem für Knochenstoffwechsel und viele Regulationsprozesse wichtig.',
      hinweis: 'Dieser Wert ist im Demo-Workflow noch nicht vollständig freigegeben und bleibt als Prüfhilfe sichtbar.',
      verlauf: [18, 21, 19, 23, 22]
    }
  ],
  kategorien: [
    { name: 'Blutbild', normal: 12, auffaellig: 0, review: 0 },
    { name: 'Entzündung', normal: 2, auffaellig: 1, review: 0 },
    { name: 'Fettstoffwechsel', normal: 4, auffaellig: 2, review: 0 },
    { name: 'Zuckerstoffwechsel', normal: 5, auffaellig: 0, review: 0 },
    { name: 'Nierenfunktion', normal: 4, auffaellig: 0, review: 0 },
    { name: 'Vitamine', normal: 2, auffaellig: 0, review: 2 }
  ],
  empfehlungen: [
    {
      id: 'empfehlung-arztgespraech',
      titel: 'Auffällige Werte ärztlich einordnen',
      text: 'Besprechen Sie insbesondere CRP, LDL-Cholesterin und Ferritin mit Ihrer Ärztin oder Ihrem Arzt. Die Werte sollten nicht isoliert bewertet werden.',
      prioritaet: 'wichtig'
    },
    {
      id: 'empfehlung-verlauf',
      titel: 'Verlaufskontrolle nutzen',
      text: 'Bei auffälligen oder steigenden Werten kann eine erneute Kontrolle sinnvoll sein, wenn dies ärztlich empfohlen wird.',
      prioritaet: 'beachten'
    },
    {
      id: 'empfehlung-fragen',
      titel: 'Fragen vorbereiten',
      text: 'Notieren Sie Beschwerden, Medikamente, Ernährung und aktuelle Belastungen, damit die Laborwerte besser eingeordnet werden können.',
      prioritaet: 'normal'
    }
  ],
  fragen: [
    'Passen der erhöhte CRP-Wert oder andere Entzündungswerte zu aktuellen Beschwerden?',
    'Welche Bedeutung hat der LDL-Wert in meinem persönlichen Risikoprofil?',
    'Sollten Ferritin und Blutbild gemeinsam kontrolliert werden?',
    'Welche Werte sollten im Verlauf erneut überprüft werden?'
  ],
  quellen: [
    { id: 'quelle-crp-demo', bereich: 'CRP', titel: 'Interne Demo-Quelle CRP', stand: '2026-06' },
    { id: 'quelle-ldl-demo', bereich: 'LDL-Cholesterin', titel: 'Interne Demo-Quelle LDL', stand: '2026-06' },
    { id: 'quelle-ferritin-demo', bereich: 'Ferritin', titel: 'Interne Demo-Quelle Ferritin', stand: '2026-06' },
    { id: 'quelle-tsh-demo', bereich: 'TSH', titel: 'Interne Demo-Quelle TSH', stand: '2026-06' }
  ],
  disclaimer: 'Dieser Bericht fasst freigegebene Testdaten verständlich zusammen. Er stellt keine Diagnose dar und ersetzt keine ärztliche Beratung, Untersuchung oder Behandlung.'
};
