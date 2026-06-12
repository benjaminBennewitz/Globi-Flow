/* src/app/core/api/api-endpoints.ts */

/**
 * @file Definiert zentrale API-Endpunkte für die spätere Backend-Anbindung.
 * @module ApiEndpoints
 */

/** Zentrale API-Routen ohne LocalStorage-Abhängigkeit. */
export const API_ENDPUNKTE = {
  dashboard: '/api/dashboard/',
  importjobs: '/api/imports/jobs/',
  upload: '/api/imports/upload/',
  review: '/api/imports/review/',
  freigabe: '/api/lab-reports/release/',
  wissensdatenbank: '/api/knowledge/',
  patientenbericht: '/api/reports/preview/'
} as const;
