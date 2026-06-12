/* src/app/core/services/patient-context.service.ts */

/**
 * @file Verwaltet den globalen Patientenkontext für alle Routen.
 * @module PatientContextService
 */

import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MOCK_PATIENTEN } from '../mocks/patienten.mock';
import { NeuerPatientInput, Patient, PatientBefund, PatientQuelle } from '../models/patient.model';
import { normalisiereSichereSuche } from '../security/sichere-suche.util';

/** Zentraler Arbeitskontext für aktive Testperson und aktiven Befund. */
@Injectable({ providedIn: 'root' })
export class PatientContextService {
  /** Alle verfügbaren Testpersonen. */
  public readonly patienten: WritableSignal<Patient[]> = signal(MOCK_PATIENTEN);

  /** Aktive Testpersonen-ID. */
  public readonly aktiverPatientId: WritableSignal<string> = signal(MOCK_PATIENTEN[0].id);

  /** Aktive Befund-ID. */
  public readonly aktiverBefundId: WritableSignal<string> = signal(MOCK_PATIENTEN[0].befundListe[0].id);

  /** Suchbegriff der globalen Patientenauswahl. */
  public readonly patientenSuche: WritableSignal<string> = signal('');

  /** Aktiver Quellenfilter der globalen Patientenauswahl. */
  public readonly patientenFilter: WritableSignal<PatientQuelle | 'alle' | 'review'> = signal('alle');

  /** Aktive Testperson. */
  public readonly aktiverPatient: Signal<Patient> = computed(() => this.patienten().find((patient: Patient) => patient.id === this.aktiverPatientId()) ?? this.patienten()[0]);

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

  /** Erstellt lokal eine neue Testperson und gibt sie zurück. */
  public patientAnlegen(input: NeuerPatientInput): Patient {
    const name = `${input.vorname.trim()} ${input.nachname.trim()}`.trim() || 'Neue Testperson';
    const nummer = input.nummer.trim() || this.naechstePatientenNummer();
    const patient: Patient = {
      id: `patient-local-${Date.now()}`,
      nummer,
      name,
      vorname: input.vorname.trim(),
      nachname: input.nachname.trim(),
      geburtsdatum: input.geburtsdatum,
      geschlecht: input.geschlecht,
      gewichtKg: input.gewichtKg,
      groesseCm: input.groesseCm,
      lebensstil: input.lebensstil.trim() || 'nicht angegeben',
      kontext: 'lokal angelegt',
      quelle: 'manuell',
      status: 'leer',
      befunde: 0,
      offeneReviews: 0,
      letzterBefund: 'kein Befund',
      berichtStatus: 'keine Daten',
      notiz: input.notiz.trim(),
      befundListe: []
    };

    this.patienten.update((patienten: Patient[]) => [patient, ...patienten]);
    return patient;
  }

  /** Prüft Such- und Quellenfilter. */
  private patientPasst(patient: Patient, suche: string): boolean {
    const suchtext = `${patient.name} ${patient.vorname} ${patient.nachname} ${patient.nummer} ${patient.kontext} ${patient.berichtStatus} ${patient.lebensstil}`.toLowerCase();
    const suchePasst = !suche || suchtext.includes(suche);
    const filter = this.patientenFilter();
    const filterPasst = filter === 'alle' || patient.quelle === filter || (filter === 'review' && patient.offeneReviews > 0);
    return suchePasst && filterPasst;
  }

  /** Erzeugt eine einfache lokale Testpersonen-ID. */
  private naechstePatientenNummer(): string {
    const nummer = this.patienten().length + 1;
    return `TP-2026-${nummer.toString().padStart(3, '0')}`;
  }
}

