/* src/app/core/services/globi-flow-api.service.ts */

/**
 * @file Kapselt die REST-API-Kommunikation mit Globi-Flow-BE.
 * @module GlobiFlowApiService
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPUNKTE } from '../api/api-endpoints';
import { AuswertungViewModel } from '../models/auswertung.model';
import { BerichtViewModel } from '../models/bericht.model';
import { DashboardViewModel } from '../models/dashboard-view.model';
import { GlobaleSucheAntwort } from '../models/globale-suche.model';
import { Importjob } from '../models/importjob.model';
import { Laborwert } from '../models/laborwert.model';
import { NeuerPatientInput, Patient } from '../models/patient.model';
import { Patientenbericht } from '../models/patientenbericht.model';
import { ReviewEintrag } from '../models/review-eintrag.model';
import { ReviewKandidat, ReviewStatus, ReviewViewModel } from '../models/review.model';
import { UebersichtViewModel } from '../models/uebersicht.model';
import { Wissenseintrag } from '../models/wissenseintrag.model';

/** Eingabe für die manuelle Laborwert-Erfassung. */
export interface ManuellerImportInput {
  /** Zugeordnete Testpersonen-ID. */
  patientId: string;

  /** Stabiler Laborwert-Key. */
  key: string;

  /** Anzeigename des Laborwerts. */
  name: string;

  /** Rohes Ergebnisfeld. */
  ergebnis: string;

  /** Einheit des Ergebnisses. */
  einheit: string;

  /** Referenzbereich als Text. */
  referenz: string;
}

/** Antwort der Befundfreigabe. */
export interface BefundFreigabeAntwort {
  /** Öffentliche Befund-ID. */
  id: string;

  /** Neuer Befundstatus. */
  status: string;

  /** ISO-Zeitpunkt der Freigabe. */
  releasedAt: string;
}


/** Antwort nach dem Zurücksetzen der Wissensbasis. */
export interface WissensbasisResetAntwort {
  /** API-Status. */
  status: string;

  /** Sichtbare Rückmeldung. */
  message: string;

  /** Anzahl der zurückgesetzten Wissenseinträge. */
  entries: number;

  /** Anzahl der gepflegten Laborwertdefinitionen. */
  analytes: number;

  /** Anzahl der Quellen. */
  sources: number;

  /** Aktualisierte Wissenseinträge. */
  items: Wissenseintrag[];
}


export interface DemoDatenResetAntwort {
  /** API-Status. */
  status: string;

  /** Sichtbare Rückmeldung. */
  message: string;

  /** Anzahl der Testpersonen nach dem Reset. */
  patients: number;

  /** Anzahl der Befunde nach dem Reset. */
  reports: number;

  /** Anzahl der Laborwerte nach dem Reset. */
  values: number;

  /** Anzahl offener Review-Kandidaten nach dem Reset. */
  reviews: number;
}

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

  /** Legt eine neue Testperson in der Datenbank an. */
  public patientAnlegen(input: NeuerPatientInput): Observable<Patient> {
    return this.http.post<Patient>(this.apiEndpunkte.patienten, input);
  }

  /** Aktualisiert eine bestehende Testperson. */
  public patientAktualisieren(patient: Patient): Observable<Patient> {
    return this.http.patch<Patient>(this.detailUrl(this.apiEndpunkte.patienten, patient.id), patient);
  }

  /** Löscht eine lokale Testperson. */
  public patientLoeschen(patientId: string): Observable<void> {
    return this.http.delete<void>(this.detailUrl(this.apiEndpunkte.patienten, patientId));
  }

  /** Liefert die fachliche Auswertungsansicht. */
  public ladeAuswertung(befundId?: string, patientId?: string): Observable<AuswertungViewModel> {
    let params = new HttpParams();

    if (befundId) {
      params = params.set('reportId', befundId);
    }

    if (patientId) {
      params = params.set('patientId', patientId);
    }

    return this.http.get<AuswertungViewModel>(this.apiEndpunkte.auswertung, { params });
  }

  /** Liefert die vollständige ärztliche Reviewansicht. */
  public ladeReview(): Observable<ReviewViewModel> {
    return this.http.get<ReviewViewModel>(this.apiEndpunkte.review);
  }

  /** Speichert einen Review-Kandidaten dauerhaft im Backend. */
  public reviewKandidatSpeichern(kandidat: ReviewKandidat): Observable<ReviewKandidat> {
    return this.http.patch<ReviewKandidat>(this.detailUrl(this.apiEndpunkte.review, kandidat.id), kandidat);
  }

  /** Setzt mehrere Review-Kandidaten in einem API-Aufruf auf einen Status. */
  public reviewKandidatenStatusSetzen(ids: string[], status: ReviewStatus): Observable<ReviewViewModel> {
    return this.http.post<ReviewViewModel>(this.apiEndpunkte.reviewBulk, { ids, status });
  }

  /** Liefert die aggregierte Übersichtsansicht. */
  public ladeUebersicht(): Observable<UebersichtViewModel> {
    return this.http.get<UebersichtViewModel>(this.apiEndpunkte.uebersicht);
  }

  /** Liefert Importjobs. */
  public ladeImportjobs(): Observable<Importjob[]> {
    return this.http.get<Importjob[]>(this.apiEndpunkte.importjobs);
  }

  /** Aktualisiert einfache Statusfelder eines Importjobs. */
  public importjobAktualisieren(job: Importjob): Observable<Importjob> {
    return this.http.patch<Importjob>(this.detailUrl(this.apiEndpunkte.importjobs, job.id), job);
  }

  /** Löscht einen Importjob. */
  public importjobLoeschen(jobId: string): Observable<void> {
    return this.http.delete<void>(this.detailUrl(this.apiEndpunkte.importjobs, jobId));
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

  /** Legt einen neuen Wissenseintrag als Entwurf an. */
  public wissenseintragAnlegen(eintrag: Partial<Wissenseintrag>): Observable<Wissenseintrag> {
    return this.http.post<Wissenseintrag>(this.apiEndpunkte.wissensdatenbank, eintrag);
  }

  /** Speichert Text, Status und Quellen eines Wissenseintrags. */
  public wissenseintragSpeichern(eintrag: Wissenseintrag & { aenderungsnotiz?: string }, originalLaborwertKey?: string): Observable<Wissenseintrag> {
    return this.http.patch<Wissenseintrag>(this.detailUrl(this.apiEndpunkte.wissensdatenbank, originalLaborwertKey || eintrag.laborwertKey), eintrag);
  }

  /** Löscht einen Wissenseintrag. */
  public wissenseintragLoeschen(eintrag: Wissenseintrag): Observable<void> {
    return this.http.delete<void>(this.detailUrl(this.apiEndpunkte.wissensdatenbank, eintrag.laborwertKey));
  }

  /** Setzt die Wissensbasis auf den Mindestbestand zurück. */
  public wissensbasisZuruecksetzen(): Observable<WissensbasisResetAntwort> {
    return this.http.post<WissensbasisResetAntwort>(this.apiEndpunkte.wissensdatenbankReset, {});
  }

  /** Liefert die kompakte Patientenbericht-Vorschau. */
  public ladePatientenbericht(): Observable<Patientenbericht> {
    return this.http.get<Patientenbericht>(this.apiEndpunkte.patientenbericht);
  }

  /** Liefert die druckfertige Berichtsvorschau. */
  public ladeBericht(befundId?: string, patientId?: string): Observable<BerichtViewModel> {
    let params = new HttpParams();

    if (befundId) {
      params = params.set('reportId', befundId);
    }

    if (patientId) {
      params = params.set('patientId', patientId);
    }

    return this.http.get<BerichtViewModel>(this.apiEndpunkte.bericht, { params });
  }

  /** Übersetzt einen druckfähigen Patientenbericht lokal in die Zielsprache. */
  public berichtUebersetzen(targetLanguage: string, befundId?: string, patientId?: string): Observable<BerichtViewModel> {
    let params = new HttpParams();

    if (befundId) {
      params = params.set('reportId', befundId);
    }

    if (patientId) {
      params = params.set('patientId', patientId);
    }

    return this.http.post<BerichtViewModel>(this.apiEndpunkte.berichtUebersetzen, { targetLanguage }, { params });
  }

  /** Gibt einen Befund für Bericht und Verlauf frei. */
  public befundFreigeben(befundId: string): Observable<BefundFreigabeAntwort> {
    return this.http.post<BefundFreigabeAntwort>(this.apiEndpunkte.freigabe, { befundId });
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

  /** Speichert eine manuelle Fallback-Erfassung als Backend-Importjob. */
  public manuellenImportAnlegen(input: ManuellerImportInput): Observable<Importjob> {
    return this.http.post<Importjob>(this.apiEndpunkte.manuellerImport, input);
  }

  /** Startet die Demo-Analyse im Backend. */
  public demoAnalyseStarten(): Observable<Importjob> {
    return this.http.post<Importjob>(this.apiEndpunkte.demoAnalyse, {});
  }


  /** Sucht global und backendseitig über alle fachlichen Hauptbereiche. */
  public globaleSuche(query: string): Observable<GlobaleSucheAntwort> {
    const params = new HttpParams().set('q', query);
    return this.http.get<GlobaleSucheAntwort>(this.apiEndpunkte.globaleSuche, { params });
  }


  /** Setzt die klinischen Demo-Daten über die Backend-API zurück. */
  public demoDatenZuruecksetzen(): Observable<DemoDatenResetAntwort> {
    return this.http.post<DemoDatenResetAntwort>(this.apiEndpunkte.demoDatenReset, {});
  }

  /** Gibt die aktuell vorgesehenen API-Endpunkte für Debug- und Dev-Anzeigen zurück. */
  public gibApiEndpunkte(): typeof API_ENDPUNKTE {
    return this.apiEndpunkte;
  }

  /** Baut eine Detail-URL aus Basisroute und öffentlicher ID. */
  private detailUrl(baseUrl: string, id: string): string {
    return `${baseUrl}${encodeURIComponent(id)}/`;
  }
}
