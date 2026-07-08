/* src/app/core/services/globi-flow-api.service.ts */

/**
 * @file Kapselt die REST-API-Kommunikation mit Globi-Flow-BE.
 * @module GlobiFlowApiService
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPUNKTE } from '../api/api-endpoints';
import { AuswertungViewModel } from '../models/auswertung.model';
import { BerichtViewModel } from '../models/bericht.model';
import { DashboardViewModel } from '../models/dashboard-view.model';
import { Importjob } from '../models/importjob.model';
import { Laborwert } from '../models/laborwert.model';
import { Patient } from '../models/patient.model';
import { Patientenbericht } from '../models/patientenbericht.model';
import { ReviewEintrag } from '../models/review-eintrag.model';
import { ReviewViewModel } from '../models/review.model';
import { UebersichtViewModel } from '../models/uebersicht.model';
import { Wissenseintrag } from '../models/wissenseintrag.model';

/** API-Service für die lokale Globi-Flow-Django-API. */
@Injectable({ providedIn: 'root' })
export class GlobiFlowApiService {
  /** Angular-HTTP-Client für REST-Aufrufe. */
  private readonly http = inject(HttpClient);

  /** Zentrale API-Routen. */
  private readonly apiEndpunkte = API_ENDPUNKTE;

  /** Liefert die komplette Datenansicht. */
  public ladeStartansicht(): Observable<DashboardViewModel> {
    return this.http.get<DashboardViewModel>(this.apiEndpunkte.dashboard);
  }

  /** Liefert zentrale Testpersonen. */
  public ladePatienten(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiEndpunkte.patienten);
  }

  /** Liefert die fachliche Auswertungsansicht. */
  public ladeAuswertung(): Observable<AuswertungViewModel> {
    return this.http.get<AuswertungViewModel>(this.apiEndpunkte.auswertung);
  }

  /** Liefert die vollständige ärztliche Reviewansicht. */
  public ladeReview(): Observable<ReviewViewModel> {
    return this.http.get<ReviewViewModel>(this.apiEndpunkte.review);
  }

  /** Liefert die aggregierte Übersichtsansicht. */
  public ladeUebersicht(): Observable<UebersichtViewModel> {
    return this.http.get<UebersichtViewModel>(this.apiEndpunkte.uebersicht);
  }

  /** Liefert Importjobs. */
  public ladeImportjobs(): Observable<Importjob[]> {
    return this.http.get<Importjob[]>(this.apiEndpunkte.importjobs);
  }

  /** Liefert Laborwerte aus der Startansicht. */
  public ladeLaborwerte(): Observable<Laborwert[]> {
    return this.http.get<DashboardViewModel>(this.apiEndpunkte.dashboard).pipe(map((daten: DashboardViewModel) => daten.laborwerte));
  }

  /** Liefert kompakte Review-Einträge aus der Startansicht. */
  public ladeReviewEintraege(): Observable<ReviewEintrag[]> {
    return this.http.get<DashboardViewModel>(this.apiEndpunkte.dashboard).pipe(map((daten: DashboardViewModel) => daten.reviewEintraege));
  }

  /** Liefert Wissenseinträge. */
  public ladeWissenseintraege(): Observable<Wissenseintrag[]> {
    return this.http.get<Wissenseintrag[]>(this.apiEndpunkte.wissensdatenbank);
  }

  /** Liefert die kompakte Patientenbericht-Vorschau. */
  public ladePatientenbericht(): Observable<Patientenbericht> {
    return this.http.get<Patientenbericht>(this.apiEndpunkte.patientenbericht);
  }

  /** Liefert die druckfertige Berichtsvorschau. */
  public ladeBericht(): Observable<BerichtViewModel> {
    return this.http.get<BerichtViewModel>(this.apiEndpunkte.bericht);
  }


  /** Lädt eine lokal geprüfte PDF-Datei zur Analyse hoch. */
  public laborbefundHochladen(datei: File, patientId?: string): Observable<Importjob> {
    const formData = new FormData();
    formData.append('file', datei);

    if (patientId) {
      formData.append('patientId', patientId);
    }

    return this.http.post<Importjob>(this.apiEndpunkte.upload, formData);
  }

  /** Startet die Demo-Analyse im Backend. */
  public demoAnalyseStarten(): Observable<Importjob> {
    return this.http.post<Importjob>(this.apiEndpunkte.demoAnalyse, {});
  }

  /** Gibt die aktuell vorgesehenen API-Endpunkte für Debug- und Dev-Anzeigen zurück. */
  public gibApiEndpunkte(): typeof API_ENDPUNKTE {
    return this.apiEndpunkte;
  }
}
