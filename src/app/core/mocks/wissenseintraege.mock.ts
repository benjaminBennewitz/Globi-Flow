/* src/app/core/mocks/wissenseintraege.mock.ts */

/**
 * @file Mockdaten für kontrollierte Wissensinhalte.
 * @module WissenseintraegeMock
 */

import { Wissenseintrag } from '../models/wissenseintrag.model';

/** Beispielhafte Wissenseinträge für Editor und Patientenbericht. */
export const MOCK_WISSENSEINTRAEGE: Wissenseintrag[] = [
  {
    id: 'wissen-haemoglobin',
    laborwertKey: 'haemoglobin',
    anzeigename: 'Hämoglobin',
    kategorie: 'Blutbild',
    patientKurztext: 'Hämoglobin ist der rote Blutfarbstoff und hilft dabei, Sauerstoff im Körper zu transportieren.',
    patientLangtext: 'Hämoglobin wird häufig gemeinsam mit weiteren Blutbildwerten betrachtet. Abweichungen können verschiedene Ursachen haben und sollten nicht isoliert bewertet werden.',
    arztinformation: 'Mit Erythrozyten, Hämatokrit, MCV, MCH, Ferritin und klinischem Kontext bewerten.',
    ursachenNiedrig: 'Blutverlust, Eisenmangel, Vitaminmangel oder chronische Erkrankungen können eine Rolle spielen.',
    ursachenHoch: 'Flüssigkeitsmangel, Höhenaufenthalt oder bestimmte Erkrankungen können höhere Werte beeinflussen.',
    einflussfaktoren: 'Hydratation, Rauchen, Höhenlage, Schwangerschaft und Trainingsstatus können die Einordnung beeinflussen.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-haemoglobin-demo', titel: 'Interne Demo-Quelle Hämoglobin', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-leukozyten',
    laborwertKey: 'leukozyten',
    anzeigename: 'Leukozyten',
    kategorie: 'Blutbild',
    patientKurztext: 'Leukozyten sind weiße Blutkörperchen und gehören zur körpereigenen Abwehr.',
    patientLangtext: 'Die Zahl der Leukozyten kann sich bei Infekten, Entzündungen, Stress oder durch Medikamente verändern. Entscheidend ist die ärztliche Einordnung mit Differentialblutbild und Beschwerden.',
    arztinformation: 'Differentialblutbild, CRP, Symptome und Verlauf berücksichtigen.',
    ursachenNiedrig: 'Bestimmte Virusinfekte, Medikamente oder Knochenmarkseinflüsse können niedrige Werte begünstigen.',
    ursachenHoch: 'Infektionen, Entzündungen, Stressreaktionen oder Medikamente können erhöhte Werte verursachen.',
    einflussfaktoren: 'Akute Belastung, Medikamente, Infektphase und Blutentnahmezeitpunkt können Einfluss haben.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-leukozyten-demo', titel: 'Interne Demo-Quelle Leukozyten', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-thrombozyten',
    laborwertKey: 'thrombozyten',
    anzeigename: 'Thrombozyten',
    kategorie: 'Blutbild',
    patientKurztext: 'Thrombozyten sind Blutplättchen und wichtig für die Blutgerinnung.',
    patientLangtext: 'Thrombozyten helfen, Blutungen zu stoppen. Zu niedrige oder hohe Werte können unterschiedliche Ursachen haben und sollten bei Auffälligkeiten ärztlich eingeordnet werden.',
    arztinformation: 'Blutbildverlauf, Gerinnung, Medikamente und Entzündungsstatus beachten.',
    ursachenNiedrig: 'Infekte, Medikamente, immunologische Ursachen oder Bildungsstörungen können eine Rolle spielen.',
    ursachenHoch: 'Entzündungen, Eisenmangel, Zustand nach Blutverlust oder andere Reaktionen können erhöhte Werte beeinflussen.',
    einflussfaktoren: 'Gerinnungsmedikamente, Entzündungen, kürzliche Infekte und Laborartefakte berücksichtigen.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-thrombozyten-demo', titel: 'Interne Demo-Quelle Thrombozyten', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'pruefung',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-crp',
    laborwertKey: 'crp',
    anzeigename: 'CRP',
    kategorie: 'Entzündung',
    patientKurztext: 'CRP ist ein Entzündungswert und kann bei Infekten oder anderen Entzündungsprozessen ansteigen.',
    patientLangtext: 'Ein erhöhter CRP-Wert bedeutet nicht automatisch eine bestimmte Erkrankung. Er zeigt zunächst nur, dass im Körper ein Entzündungsprozess möglich ist.',
    arztinformation: 'CRP im Verlauf, klinische Symptomatik und weitere Entzündungsparameter gemeinsam bewerten.',
    ursachenNiedrig: 'Niedrige CRP-Werte haben meist keinen eigenständigen Krankheitswert.',
    ursachenHoch: 'Infektionen, akute oder chronische Entzündungen, Gewebeschäden oder postoperative Zustände können den Wert erhöhen.',
    einflussfaktoren: 'Zeitpunkt der Blutentnahme, Beschwerden, Medikamente und Verlaufskontrollen beeinflussen die Interpretation.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-crp-demo', titel: 'Interne Demo-Quelle CRP', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 2,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 2, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-glukose',
    laborwertKey: 'glukose',
    anzeigename: 'Glukose',
    kategorie: 'Zuckerstoffwechsel',
    patientKurztext: 'Glukose ist der Blutzuckerwert und zeigt die aktuelle Zuckerkonzentration im Blut.',
    patientLangtext: 'Der Glukosewert hängt stark davon ab, ob die Blutentnahme nüchtern erfolgte und wann zuletzt gegessen wurde. Einzelwerte sollten im Verlauf und mit weiteren Werten betrachtet werden.',
    arztinformation: 'Nüchternstatus, HbA1c, Medikation und klinischen Kontext prüfen.',
    ursachenNiedrig: 'Längeres Fasten, Medikamente oder Stoffwechselreaktionen können niedrige Werte beeinflussen.',
    ursachenHoch: 'Nahrungsaufnahme, Stress, Infekte oder Störungen des Zuckerstoffwechsels können hohe Werte begünstigen.',
    einflussfaktoren: 'Nüchternstatus, Uhrzeit, Ernährung, Stress und Medikamente beachten.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-glukose-demo', titel: 'Interne Demo-Quelle Glukose', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-hba1c',
    laborwertKey: 'hba1c',
    anzeigename: 'HbA1c',
    kategorie: 'Zuckerstoffwechsel',
    patientKurztext: 'HbA1c beschreibt vereinfacht den durchschnittlichen Blutzucker der letzten Wochen.',
    patientLangtext: 'HbA1c wird häufig zur langfristigen Einschätzung des Zuckerstoffwechsels genutzt. Der Wert sollte mit aktuellen Glukosewerten und der medizinischen Vorgeschichte eingeordnet werden.',
    arztinformation: 'Mit Glukosewerten, Anämiehinweisen, Nierenfunktion und Therapieanamnese abgleichen.',
    ursachenNiedrig: 'Bestimmte Blutbildveränderungen oder verkürzte Erythrozytenlebensdauer können niedrigere Werte beeinflussen.',
    ursachenHoch: 'Anhaltend erhöhte Blutzuckerwerte können sich in einem höheren HbA1c zeigen.',
    einflussfaktoren: 'Blutbildveränderungen, Nierenfunktion, Schwangerschaft und Messmethode berücksichtigen.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-hba1c-demo', titel: 'Interne Demo-Quelle HbA1c', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-kreatinin',
    laborwertKey: 'kreatinin',
    anzeigename: 'Kreatinin',
    kategorie: 'Nierenfunktion',
    patientKurztext: 'Kreatinin ist ein Laborwert, der häufig zur Einschätzung der Nierenfunktion genutzt wird.',
    patientLangtext: 'Kreatinin entsteht im Muskelstoffwechsel. Die Einordnung hängt unter anderem von Alter, Muskelmasse, Flüssigkeitshaushalt und weiteren Nierenwerten ab.',
    arztinformation: 'eGFR, Harnstoff, Elektrolyte, Urinbefund und Verlauf mitbewerten.',
    ursachenNiedrig: 'Niedrige Werte können bei geringer Muskelmasse vorkommen und sind oft kontextabhängig.',
    ursachenHoch: 'Nierenfunktionsstörungen, Flüssigkeitsmangel oder hohe Muskelmasse können höhere Werte beeinflussen.',
    einflussfaktoren: 'Muskelmasse, Ernährung, Hydratation, Medikamente und Sport vor Blutentnahme beachten.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-kreatinin-demo', titel: 'Interne Demo-Quelle Kreatinin', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-alt',
    laborwertKey: 'alt_gpt',
    anzeigename: 'ALT / GPT',
    kategorie: 'Leberwerte',
    patientKurztext: 'ALT, auch GPT genannt, ist ein Leberwert und kann bei Belastung von Leberzellen ansteigen.',
    patientLangtext: 'ALT wird meist gemeinsam mit weiteren Leberwerten bewertet. Ein auffälliger Wert allein erklärt noch nicht die Ursache und sollte ärztlich eingeordnet werden.',
    arztinformation: 'AST, GGT, AP, Bilirubin, Medikamente, Alkohol- und Stoffwechselanamnese berücksichtigen.',
    ursachenNiedrig: 'Niedrige Werte haben meist keine eigenständige Bedeutung.',
    ursachenHoch: 'Leberzellbelastung, Medikamente, Alkohol, Stoffwechsel oder Infekte können erhöhte Werte beeinflussen.',
    einflussfaktoren: 'Medikamente, Alkohol, Sport, Infekte und Probenqualität beachten.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-alt_gpt-demo', titel: 'Interne Demo-Quelle ALT / GPT', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'pruefung',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-tsh',
    laborwertKey: 'tsh',
    anzeigename: 'TSH',
    kategorie: 'Schilddrüse',
    patientKurztext: 'TSH ist ein Steuerhormon und wird häufig zur Einschätzung der Schilddrüsenfunktion genutzt.',
    patientLangtext: 'TSH zeigt, wie stark die Schilddrüse durch die Hirnanhangsdrüse angeregt wird. Die Bewertung erfolgt meist zusammen mit weiteren Schilddrüsenwerten und Beschwerden.',
    arztinformation: 'Freies T4, freies T3, Medikation, Schwangerschaft und Symptome mitbewerten.',
    ursachenNiedrig: 'Eine Überfunktion oder Schilddrüsenmedikation kann mit niedrigen TSH-Werten einhergehen.',
    ursachenHoch: 'Eine Unterfunktion oder unzureichende Hormonwirkung kann mit höheren TSH-Werten verbunden sein.',
    einflussfaktoren: 'Tageszeit, Medikamente, Schwangerschaft, Biotin und Kontrollen im Verlauf beachten.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-tsh-demo', titel: 'Interne Demo-Quelle TSH', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 1,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  },
  {
    id: 'wissen-ldl',
    laborwertKey: 'ldl_cholesterin',
    anzeigename: 'LDL-Cholesterin',
    kategorie: 'Fettstoffwechsel',
    patientKurztext: 'LDL-Cholesterin wird häufig im Zusammenhang mit dem Herz-Kreislauf-Risiko betrachtet.',
    patientLangtext: 'Ein erhöhter LDL-Wert ist keine Diagnose. Er kann aber ein wichtiger Baustein bei der ärztlichen Einschätzung des persönlichen Risikoprofils sein.',
    arztinformation: 'LDL-Zielwerte abhängig von Risikoprofil, Vorerkrankungen und Gesamtprofil bewerten.',
    ursachenNiedrig: 'Niedrige Werte können unter anderem durch Ernährung, Medikamente oder individuelle Stoffwechsellage bedingt sein.',
    ursachenHoch: 'Ernährung, genetische Faktoren, Stoffwechselstörungen oder Begleiterkrankungen können höhere Werte beeinflussen.',
    einflussfaktoren: 'Nüchternstatus, Medikamente, Ernährung, Gewichtsentwicklung und Begleiterkrankungen berücksichtigen.',
    hinweise: 'Auffällige Werte sollten im ärztlichen Gespräch immer zusammen mit Beschwerden, Verlauf und weiteren Befunden eingeordnet werden.',
    disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
    quellen: [
      { id: 'quelle-ldl_cholesterin-demo', titel: 'Interne Demo-Quelle LDL-Cholesterin', typ: 'demo', stand: '2026-06', referenz: 'Kontrollierter lokaler Demo-Seed', hinweis: 'Platzhalter für später geprüfte Quellenpflege.' }
    ],
    version: 2,
    status: 'freigegeben',
    geaendertAm: '12.06.2026',
    geaendertVon: 'Admin',
    versionen: [
      { version: 2, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Kontrollierter Demo-Seed für die Wissensbasis.' }
    ]
  }
];
