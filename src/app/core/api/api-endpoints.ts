/* src/app/core/api/api-endpoints.ts */

/**
 * @file Definiert zentrale API-Endpunkte für die Backend-Anbindung.
 * @module ApiEndpoints
 */

/** Lokale Basis-URL des Django-Backends. */
export const API_BASIS_URL = 'http://127.0.0.1:8000/api';

/** Zentrale API-Routen ohne LocalStorage- oder Mock-Abhängigkeit. */
export const API_ENDPUNKTE = {
  dashboard: `${API_BASIS_URL}/dashboard/`,
  patienten: `${API_BASIS_URL}/patients/`,
  uebersicht: `${API_BASIS_URL}/overview/`,
  auswertung: `${API_BASIS_URL}/auswertung/`,
  importjobs: `${API_BASIS_URL}/imports/jobs/`,
  imports: `${API_BASIS_URL}/imports/`,
  upload: `${API_BASIS_URL}/imports/upload/`,
  manuellerImport: `${API_BASIS_URL}/imports/manual/`,
  demoAnalyse: `${API_BASIS_URL}/imports/demo/`,
  review: `${API_BASIS_URL}/imports/review/`,
  reviewBulk: `${API_BASIS_URL}/imports/review/bulk/`,
  freigabe: `${API_BASIS_URL}/lab-reports/release/`,
  wissensdatenbank: `${API_BASIS_URL}/knowledge/`,
  berichte: `${API_BASIS_URL}/reports/`,
  bericht: `${API_BASIS_URL}/reports/preview/`,
  patientenbericht: `${API_BASIS_URL}/reports/patient-preview/`,
  globaleSuche: `${API_BASIS_URL}/search/`
} as const;
