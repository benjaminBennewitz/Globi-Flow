/* src/app/core/services/daten-dashboard-api.service.ts */

/**
 * @file Kapselt die Datenversorgung und bleibt für die spätere REST-API vorbereitet.
 * @module DatenDashboardApiService
 */

import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { API_ENDPUNKTE } from '../api/api-endpoints';
import { AuswertungViewModel } from '../models/auswertung.model';
import { DashboardViewModel } from '../models/dashboard-view.model';
import { Importjob } from '../models/importjob.model';
import { Laborwert } from '../models/laborwert.model';
import { Patient } from '../models/patient.model';
import { Patientenbericht } from '../models/patientenbericht.model';
import { ReviewEintrag } from '../models/review-eintrag.model';
import { ReviewViewModel } from '../models/review.model';
import { UebersichtViewModel } from '../models/uebersicht.model';
import { Wissenseintrag } from '../models/wissenseintrag.model';
import { MOCK_AUSWERTUNG } from '../mocks/auswertung.mock';
import { MOCK_DASHBOARD_VIEW } from '../mocks/dashboard-view.mock';
import { MOCK_IMPORTJOBS } from '../mocks/importjobs.mock';
import { MOCK_PATIENTEN } from '../mocks/patienten.mock';
import { MOCK_REVIEW } from '../mocks/review.mock';
import { MOCK_UEBERSICHT } from '../mocks/uebersicht.mock';

/** API-bereiter Datenservice ohne lokale Persistenz. */
@Injectable({ providedIn: 'root' })
export class DatenDashboardApiService {
  /** Zentrale API-Routen für die spätere Backend-Anbindung. */
  private readonly apiEndpunkte = API_ENDPUNKTE;

  /** Liefert die komplette Datenansicht aktuell aus Mockdaten. */
  public ladeStartansicht(): Observable<DashboardViewModel> {
    return of(MOCK_DASHBOARD_VIEW).pipe(delay(120));
  }

  /** Liefert zentrale Testpersonen aus Mockdaten. */
  public ladePatienten(): Observable<Patient[]> {
    return of(MOCK_PATIENTEN).pipe(delay(90));
  }

  /** Liefert die fachliche Auswertungsansicht aus Mockdaten. */
  public ladeAuswertung(): Observable<AuswertungViewModel> {
    return of(MOCK_AUSWERTUNG).pipe(delay(90));
  }

  /** Liefert die vollständige ärztliche Reviewansicht aus Mockdaten. */
  public ladeReview(): Observable<ReviewViewModel> {
    return of(MOCK_REVIEW).pipe(delay(90));
  }

  /** Liefert die aggregierte Übersichtsansicht aus Mockdaten. */
  public ladeUebersicht(): Observable<UebersichtViewModel> {
    return of(MOCK_UEBERSICHT).pipe(delay(100));
  }

  /** Liefert Importjobs aus Mockdaten und später aus `apiEndpunkte.importjobs`. */
  public ladeImportjobs(): Observable<Importjob[]> {
    return of(MOCK_IMPORTJOBS).pipe(delay(80));
  }

  /** Liefert Laborwerte aus Mockdaten und später aus `apiEndpunkte.dashboard`. */
  public ladeLaborwerte(): Observable<Laborwert[]> {
    return of(MOCK_DASHBOARD_VIEW.laborwerte).pipe(delay(80));
  }

  /** Liefert Review-Einträge aus Mockdaten und später aus `apiEndpunkte.review`. */
  public ladeReviewEintraege(): Observable<ReviewEintrag[]> {
    return of(MOCK_DASHBOARD_VIEW.reviewEintraege).pipe(delay(80));
  }

  /** Liefert Wissenseinträge aus Mockdaten und später aus `apiEndpunkte.wissensdatenbank`. */
  public ladeWissenseintraege(): Observable<Wissenseintrag[]> {
    return of(MOCK_DASHBOARD_VIEW.wissenseintraege).pipe(delay(80));
  }

  /** Liefert Berichtsvorschau aus Mockdaten und später aus `apiEndpunkte.patientenbericht`. */
  public ladePatientenbericht(): Observable<Patientenbericht> {
    return of(MOCK_DASHBOARD_VIEW.patientenbericht).pipe(delay(80));
  }

  /** Gibt die aktuell vorgesehenen API-Endpunkte für Debug- und Dev-Anzeigen zurück. */
  public gibApiEndpunkte(): typeof API_ENDPUNKTE {
    return this.apiEndpunkte;
  }
}
