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
  public readonly aktiverPatientId: WritableSignal<string> = signal('');

  /** Aktive Befund-ID. */
  public readonly aktiverBefundId: WritableSignal<string> = signal('');

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
    this.aktiverPatientId.set(patient.id);
    this.aktiverBefundId.set(patient.befundListe[0]?.id ?? '');
  }

  /** Setzt den aktiven Befund, wenn er zur aktiven Testperson gehört. */
  public befundSetzen(befund: PatientBefund): void {
    const passtZumPatienten = this.aktiverPatient().befundListe.some((eintrag: PatientBefund) => eintrag.id === befund.id);

    if (passtZumPatienten) {
      this.aktiverBefundId.set(befund.id);
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
        const aktiverPatientNochVorhanden = daten.some((patient: Patient) => patient.id === this.aktiverPatientId());
        if (kontextZuruecksetzen || !aktiverPatientNochVorhanden) {
          this.aktiverPatientId.set(daten[0].id);
          this.aktiverBefundId.set(daten[0].befundListe[0]?.id ?? '');
        }
      }
    });
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
