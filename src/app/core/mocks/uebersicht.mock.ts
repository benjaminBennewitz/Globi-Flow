/* src/app/core/mocks/uebersicht.mock.ts */

/**
 * @file Mockdaten für die allgemeine Arztübersicht.
 * @module UebersichtMock
 */

import { UebersichtViewModel } from '../models/uebersicht.model';

/** Aggregierte Mockdaten für die Übersichtsroute. */
export const MOCK_UEBERSICHT: UebersichtViewModel = {
  kennzahlen: {
    patientenGesamt: 48,
    berichteGesamt: 126,
    importeGeprueft: 96,
    importeUngeprueft: 18,
    berichteFreigegeben: 74,
    reviewOffen: 12
  },
  gesundheitsverlauf: [
    { jahr: 2024, monat: 1, label: 'Jan', unauffaellig: 16, auffaellig: 7 },
    { jahr: 2024, monat: 2, label: 'Feb', unauffaellig: 17, auffaellig: 8 },
    { jahr: 2024, monat: 3, label: 'Mär', unauffaellig: 18, auffaellig: 8 },
    { jahr: 2024, monat: 4, label: 'Apr', unauffaellig: 17, auffaellig: 15 },
    { jahr: 2024, monat: 5, label: 'Mai', unauffaellig: 19, auffaellig: 10 },
    { jahr: 2024, monat: 6, label: 'Jun', unauffaellig: 21, auffaellig: 13 },
    { jahr: 2024, monat: 7, label: 'Jul', unauffaellig: 20, auffaellig: 19 },
    { jahr: 2024, monat: 8, label: 'Aug', unauffaellig: 22, auffaellig: 18 },
    { jahr: 2024, monat: 9, label: 'Sep', unauffaellig: 23, auffaellig: 24 },
    { jahr: 2024, monat: 10, label: 'Okt', unauffaellig: 25, auffaellig: 20 },
    { jahr: 2024, monat: 11, label: 'Nov', unauffaellig: 24, auffaellig: 27 },
    { jahr: 2024, monat: 12, label: 'Dez', unauffaellig: 28, auffaellig: 23 },
    { jahr: 2025, monat: 1, label: 'Jan', unauffaellig: 22, auffaellig: 9 },
    { jahr: 2025, monat: 2, label: 'Feb', unauffaellig: 24, auffaellig: 10 },
    { jahr: 2025, monat: 3, label: 'Mär', unauffaellig: 25, auffaellig: 11 },
    { jahr: 2025, monat: 4, label: 'Apr', unauffaellig: 24, auffaellig: 21 },
    { jahr: 2025, monat: 5, label: 'Mai', unauffaellig: 27, auffaellig: 17 },
    { jahr: 2025, monat: 6, label: 'Jun', unauffaellig: 29, auffaellig: 22 },
    { jahr: 2025, monat: 7, label: 'Jul', unauffaellig: 30, auffaellig: 27 },
    { jahr: 2025, monat: 8, label: 'Aug', unauffaellig: 28, auffaellig: 31 },
    { jahr: 2025, monat: 9, label: 'Sep', unauffaellig: 33, auffaellig: 26 },
    { jahr: 2025, monat: 10, label: 'Okt', unauffaellig: 35, auffaellig: 34 },
    { jahr: 2025, monat: 11, label: 'Nov', unauffaellig: 34, auffaellig: 37 },
    { jahr: 2025, monat: 12, label: 'Dez', unauffaellig: 38, auffaellig: 30 },
    { jahr: 2026, monat: 1, label: 'Jan', unauffaellig: 29, auffaellig: 12 },
    { jahr: 2026, monat: 2, label: 'Feb', unauffaellig: 31, auffaellig: 14 },
    { jahr: 2026, monat: 3, label: 'Mär', unauffaellig: 30, auffaellig: 18 },
    { jahr: 2026, monat: 4, label: 'Apr', unauffaellig: 27, auffaellig: 25 },
    { jahr: 2026, monat: 5, label: 'Mai', unauffaellig: 34, auffaellig: 20 },
    { jahr: 2026, monat: 6, label: 'Jun', unauffaellig: 36, auffaellig: 27 },
    { jahr: 2026, monat: 7, label: 'Jul', unauffaellig: 35, auffaellig: 35 },
    { jahr: 2026, monat: 8, label: 'Aug', unauffaellig: 38, auffaellig: 30 },
    { jahr: 2026, monat: 9, label: 'Sep', unauffaellig: 34, auffaellig: 42 },
    { jahr: 2026, monat: 10, label: 'Okt', unauffaellig: 39, auffaellig: 33 },
    { jahr: 2026, monat: 11, label: 'Nov', unauffaellig: 43, auffaellig: 40 },
    { jahr: 2026, monat: 12, label: 'Dez', unauffaellig: 45, auffaellig: 44 }
  ],
  dringendeHinweise: [
    {
      id: 'urgent-review-001',
      titel: 'Review seit 8 Tagen offen',
      beschreibung: 'Befund „Testperson 12 – Stoffwechsel“ enthält 4 auffällige Werte und wurde noch nicht ärztlich freigegeben.',
      seit: '8 Tage',
      status: 'kritisch'
    },
    {
      id: 'urgent-import-002',
      titel: 'OCR-Import mit niedriger Confidence',
      beschreibung: 'Ein bildbasierter Laborbefund liegt bei 61 % Confidence. Originalausschnitt sollte geprüft werden.',
      seit: '3 Tage',
      status: 'warnung'
    },
    {
      id: 'urgent-report-003',
      titel: 'Patientenbericht vorbereitet',
      beschreibung: 'Ein Bericht ist vollständig geprüft und wartet nur noch auf Freigabe für die Patientenansicht.',
      seit: 'Heute',
      status: 'info'
    }
  ],
  aktivitaeten: [
    {
      id: 'activity-001',
      zeitpunkt: 'Heute, 10:42',
      tagOffset: 0,
      titel: 'Import abgeschlossen',
      beschreibung: 'testdaten-laborbefund-optimiert.pdf wurde lokal analysiert.',
      status: 'erledigt'
    },
    {
      id: 'activity-002',
      zeitpunkt: 'Heute, 10:18',
      tagOffset: 0,
      titel: 'Review-Markierung gesetzt',
      beschreibung: 'Vitamin D wurde wegen unsicherer Einheit in Review übernommen.',
      status: 'warnung'
    },
    {
      id: 'activity-003',
      zeitpunkt: 'Gestern, 16:05',
      tagOffset: 1,
      titel: 'Bericht freigegeben',
      beschreibung: 'Patientenbericht für Testperson Demo wurde erstellt.',
      status: 'erledigt'
    },
    {
      id: 'activity-004',
      zeitpunkt: 'Gestern, 14:22',
      tagOffset: 1,
      titel: 'Wissenseintrag aktualisiert',
      beschreibung: 'CRP-Patientenerklärung wurde auf Version 1.1 gesetzt.',
      status: 'info'
    },
    {
      id: 'activity-005',
      zeitpunkt: 'Vor 3 Tagen, 09:11',
      tagOffset: 3,
      titel: 'OCR-Import erstellt',
      beschreibung: 'Ein bildbasierter Befund wurde in die lokale OCR-Warteschlange übernommen.',
      status: 'warnung'
    },
    {
      id: 'activity-006',
      zeitpunkt: 'Vor 6 Tagen, 12:40',
      tagOffset: 6,
      titel: 'Referenzbereich korrigiert',
      beschreibung: 'Ferritin-Referenzbereich wurde nach ärztlicher Prüfung angepasst.',
      status: 'erledigt'
    }
  ]
};
