/* src/app/core/services/patient-context.service.ts */

/**
 * @file Verwaltet den globalen Patientenkontext über die Backend-API.
 * @module PatientContextService
 */

import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { NeuerPatientInput, Patient, PatientBefund, PatientQuelle } from '../models/patient.model';
import { normalisiereSichereSuche } from '../security/sichere-suche.util';
import { GlobiFlowApiService } from './globi-flow-api.service';

/** Storage-Key für die aktive Testperson. */
const AKTIVER_PATIENT_STORAGE_KEY = 'globi-flow-active-patient-id';

/** Storage-Key für den aktiven Befund. */
const AKTIVER_BEFUND_STORAGE_KEY = 'globi-flow-active-report-id';

/** Fallback, bis die API-Daten geladen sind. */
const LEERER_PATIENT: Patient = {
  id: '',
  nummer: '–',
  name: 'Daten werden geladen',
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  geschlecht: 'unbekannt',
  gewichtKg: null,
  groesseCm: null,
  lebensstil: 'nicht angegeben',
  nichtrauchen: false,
  alkohol: false,
  drogen: false,
  kontext: 'API wird geladen',
  quelle: 'demo',
  status: 'leer',
  befunde: 0,
  offeneReviews: 0,
  letzterBefund: 'kein Befund',
  berichtStatus: 'keine Daten',
  notiz: '',
  befundListe: []
};

/** Zentraler Arbeitskontext für aktive Testperson und aktiven Befund. */
@Injectable({ providedIn: 'root' })
export class PatientContextService {
  /** API-Service für Patientendaten. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Alle verfügbaren Testpersonen. */
  public readonly patienten: WritableSignal<Patient[]> = signal([LEERER_PATIENT]);

  /** Aktive Testpersonen-ID. */
  public readonly aktiverPatientId: WritableSignal<string> = signal(this.gespeichertenWertLesen(AKTIVER_PATIENT_STORAGE_KEY));

  /** Aktive Befund-ID. */
  public readonly aktiverBefundId: WritableSignal<string> = signal(this.gespeichertenWertLesen(AKTIVER_BEFUND_STORAGE_KEY));

  /** Suchbegriff der globalen Patientenauswahl. */
  public readonly patientenSuche: WritableSignal<string> = signal('');

  /** Aktiver Quellenfilter der globalen Patientenauswahl. */
  public readonly patientenFilter: WritableSignal<PatientQuelle | 'alle' | 'review'> = signal('alle');

  /** Aktive Testperson. */
  public readonly aktiverPatient: Signal<Patient> = computed(() => this.patienten().find((patient: Patient) => patient.id === this.aktiverPatientId()) ?? this.patienten()[0] ?? LEERER_PATIENT);

  /** Aktiver Befund der aktiven Testperson. */
  public readonly aktiverBefund: Signal<PatientBefund | null> = computed(() => {
    const patient = this.aktiverPatient();
    return patient.befundListe.find((befund: PatientBefund) => befund.id === this.aktiverBefundId()) ?? patient.befundListe[0] ?? null;
  });

  /** Gefilterte Testpersonen für Topbar und Patientenroute. */
  public readonly gefiltertePatienten: Signal<Patient[]> = computed(() => {
    const suche = this.patientenSuche().trim().toLowerCase();
    return this.patienten().filter((patient: Patient) => this.patientPasst(patient, suche));
  });

  /** Lädt initial die Testpersonen aus der API. */
  public constructor() {
    this.patientenAusApiLaden();
  }

  /** Setzt die aktive Testperson und wählt den ersten Befund. */
  public patientSetzen(patient: Patient): void {
    const befundId = patient.befundListe[0]?.id ?? '';
    this.aktiverPatientId.set(patient.id);
    this.aktiverBefundId.set(befundId);
    this.arbeitskontextSpeichern(patient.id, befundId);
  }

  /** Setzt den aktiven Befund, wenn er zur aktiven Testperson gehört. */
  public befundSetzen(befund: PatientBefund): void {
    const passtZumPatienten = this.aktiverPatient().befundListe.some((eintrag: PatientBefund) => eintrag.id === befund.id);

    if (passtZumPatienten) {
      this.aktiverBefundId.set(befund.id);
      this.arbeitskontextSpeichern(this.aktiverPatient().id, befund.id);
    }
  }

  /** Aktualisiert die sichere Patientensuche. */
  public patientenSucheSetzen(wert: string): void {
    this.patientenSuche.set(normalisiereSichereSuche(wert).wert);
  }

  /** Setzt den Quellenfilter der Patientenauswahl. */
  public patientenFilterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientenFilter.set(filter);
  }

  /** Erstellt eine neue Testperson über die Backend-API und aktualisiert den lokalen Signalzustand. */
  public patientAnlegen(input: NeuerPatientInput): Observable<Patient> {
    return this.globiFlowApi.patientAnlegen(input).pipe(
      tap((patient: Patient) => {
        this.patienten.update((patienten: Patient[]) => [patient, ...patienten.filter((eintrag: Patient) => eintrag.id && eintrag.id !== patient.id)]);
      })
    );
  }

  /** Aktualisiert eine Testperson über die Backend-API und ersetzt sie im lokalen Signalzustand. */
  public patientAktualisieren(patientId: string, input: NeuerPatientInput): Observable<Patient> {
    return this.globiFlowApi.patientAktualisieren({ id: patientId, ...input } as Patient).pipe(
      tap((patient: Patient) => {
        this.patienten.update((patienten: Patient[]) => patienten.map((eintrag: Patient) => eintrag.id === patient.id ? patient : eintrag));
        if (this.aktiverPatientId() === patient.id) {
          this.arbeitskontextSpeichern(patient.id, this.aktiverBefundId());
        }
      })
    );
  }

  /** Löscht eine Testperson über die Backend-API und setzt bei Bedarf einen neuen Arbeitskontext. */
  public patientLoeschen(patientId: string): Observable<void> {
    return this.globiFlowApi.patientLoeschen(patientId).pipe(
      tap(() => {
        const patienten = this.patienten().filter((patient: Patient) => patient.id !== patientId);
        const daten = patienten.length ? patienten : [LEERER_PATIENT];
        this.patienten.set(daten);

        if (this.aktiverPatientId() === patientId) {
          const naechsterPatient = daten[0];
          const naechsterBefund = naechsterPatient.befundListe[0]?.id ?? '';
          this.aktiverPatientId.set(naechsterPatient.id);
          this.aktiverBefundId.set(naechsterBefund);
          this.arbeitskontextSpeichern(naechsterPatient.id, naechsterBefund);
        }
      })
    );
  }

  /** Lädt die Patientendaten nach Backend-Änderungen neu. */
  public patientenNeuLaden(): void {
    this.patientenAusApiLaden(false);
  }

  /** Lädt Patientendaten aus der Backend-API. */
  private patientenAusApiLaden(kontextZuruecksetzen = true): void {
    this.globiFlowApi.ladePatienten().subscribe({
      next: (patienten: Patient[]) => {
        const daten = patienten.length ? patienten : [LEERER_PATIENT];
        this.patienten.set(daten);
        const gespeicherterPatientId = this.gespeichertenWertLesen(AKTIVER_PATIENT_STORAGE_KEY);
        const gespeicherterBefundId = this.gespeichertenWertLesen(AKTIVER_BEFUND_STORAGE_KEY);
        const zielPatientId = kontextZuruecksetzen ? (gespeicherterPatientId || this.aktiverPatientId()) : this.aktiverPatientId();
        const patient = daten.find((eintrag: Patient) => eintrag.id === zielPatientId) ?? daten[0];
        const befund = patient.befundListe.find((eintrag: PatientBefund) => eintrag.id === (gespeicherterBefundId || this.aktiverBefundId())) ?? patient.befundListe[0] ?? null;
        this.aktiverPatientId.set(patient.id);
        this.aktiverBefundId.set(befund?.id ?? '');
        this.arbeitskontextSpeichern(patient.id, befund?.id ?? '');
      }
    });
  }


  /** Speichert den aktiven Arbeitskontext lokal für Reloads und Routenwechsel. */
  private arbeitskontextSpeichern(patientId: string, befundId: string): void {
    if (!patientId || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(AKTIVER_PATIENT_STORAGE_KEY, patientId);
    localStorage.setItem(AKTIVER_BEFUND_STORAGE_KEY, befundId);
  }

  /** Liest einen gespeicherten Arbeitskontext-Wert fallback-sicher aus. */
  private gespeichertenWertLesen(key: string): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    return localStorage.getItem(key) ?? '';
  }

  /** Prüft Such- und Quellenfilter. */
  private patientPasst(patient: Patient, suche: string): boolean {
    const lifestyleStatus = `${patient.nichtrauchen ? 'nichtraucher nicht rauchen' : 'rauchen unklar'} ${patient.alkohol ? 'alkohol' : 'kein alkohol'} ${patient.drogen ? 'drogen' : 'keine drogen'}`;
    const suchtext = `${patient.name} ${patient.vorname} ${patient.nachname} ${patient.nummer} ${patient.kontext} ${patient.berichtStatus} ${patient.lebensstil} ${lifestyleStatus}`.toLowerCase();
    const suchePasst = !suche || suchtext.includes(suche);
    const filter = this.patientenFilter();
    const filterPasst = filter === 'alle' || patient.quelle === filter || (filter === 'review' && patient.offeneReviews > 0);
    return suchePasst && filterPasst;
  }

}
