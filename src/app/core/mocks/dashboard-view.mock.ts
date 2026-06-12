/* src/app/core/mocks/dashboard-view.mock.ts */

/**
 * @file Bündelt alle Mockdaten für die Startansicht.
 * @module DashboardViewMock
 */

import { DashboardViewModel } from '../models/dashboard-view.model';
import { MOCK_DASHBOARD_TRENDS, MOCK_LABORWERTE, MOCK_LABORWERT_GRUPPEN } from './laborwerte.mock';
import { MOCK_IMPORTJOBS } from './importjobs.mock';
import { MOCK_PATIENTENBERICHT } from './patientenbericht.mock';
import { MOCK_REVIEW_EINTRAEGE } from './review-eintraege.mock';
import { MOCK_WISSENSEINTRAEGE } from './wissenseintraege.mock';

/** Zentraler Mock für die API-bereite Datenansicht. */
export const MOCK_DASHBOARD_VIEW: DashboardViewModel = {
  kennzahlen: {
    befunde: 2,
    laborwerte: 37,
    review: 4,
    berichte: 1,
    confidence: 94
  },
  importjobs: MOCK_IMPORTJOBS,
  laborwerte: MOCK_LABORWERTE,
  gruppen: MOCK_LABORWERT_GRUPPEN,
  trends: MOCK_DASHBOARD_TRENDS,
  reviewEintraege: MOCK_REVIEW_EINTRAEGE,
  wissenseintraege: MOCK_WISSENSEINTRAEGE,
  patientenbericht: MOCK_PATIENTENBERICHT
};
