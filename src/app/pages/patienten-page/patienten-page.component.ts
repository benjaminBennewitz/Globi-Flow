/* src/app/pages/patienten-page/patienten-page.component.ts */

/**
 * @file Routenseite zur Verwaltung zentraler Testpersonen.
 * @module PatientenPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeuerPatientInput, Patient, PatientGeschlecht, PatientQuelle, PatientStatus } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ToastService } from '../../shared/services/toast.service';
import { IconActionComponent } from '../../shared/components/icon-action/icon-action.component';
import { SecureSearchComponent } from '../../shared/components/secure-search/secure-search.component';

/** Sortieroptionen der Patientenliste. */
type PatientenSortierung = 'aktualisiert' | 'review' | 'name';

/** Route `/patienten` für Testpersonen, Befunde und globale Auswahl. */
@Component({
  selector: 'gf-patienten-page',
  imports: [IconActionComponent, RouterLink, SecureSearchComponent],
  templateUrl: './patienten-page.component.html',
  styleUrl: './patienten-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientenPageComponent {
  /** Globaler Patientenkontext. */
  public readonly patientContext = inject(PatientContextService);

  /** Toast-Service für API-Rückmeldungen. */
  private readonly toastService = inject(ToastService);

  /** Gibt an, ob das Anlage- oder Bearbeitungsmodal geöffnet ist. */
  public readonly modalOffen: WritableSignal<boolean> = signal(false);

  /** Testperson, die aktuell bearbeitet wird. */
  public readonly bearbeiteterPatient: WritableSignal<Patient | null> = signal(null);

  /** Testperson, deren Löschung bestätigt werden muss. */
  public readonly patientZumLoeschen: WritableSignal<Patient | null> = signal(null);

  /** Aktive Sortierung. */
  public readonly sortierung: WritableSignal<PatientenSortierung> = signal('aktualisiert');

  /** Eingabe Vorname. */
  public readonly neuerVorname: WritableSignal<string> = signal('');

  /** Eingabe Nachname. */
  public readonly neuerNachname: WritableSignal<string> = signal('');

  /** Eingabe Testpersonen-ID. */
  public readonly neueNummer: WritableSignal<string> = signal('');

  /** Eingabe Geburtsdatum. */
  public readonly neuesGeburtsdatum: WritableSignal<string> = signal('');

  /** Eingabe Gewicht. */
  public readonly neuesGewicht: WritableSignal<string> = signal('');

  /** Eingabe Größe. */
  public readonly neueGroesse: WritableSignal<string> = signal('');

  /** Eingabe Lebensstil. */
  public readonly neuerLebensstil: WritableSignal<string> = signal('');

  /** Gibt an, ob die neue Testperson nicht raucht. */
  public readonly neuesNichtrauchen: WritableSignal<boolean> = signal(false);

  /** Gibt an, ob Alkoholkonsum dokumentiert ist. */
  public readonly neuerAlkohol: WritableSignal<boolean> = signal(false);

  /** Gibt an, ob Drogenkonsum dokumentiert ist. */
  public readonly neueDrogen: WritableSignal<boolean> = signal(false);

  /** Eingabe Geschlecht. */
  public readonly neuesGeschlecht: WritableSignal<PatientGeschlecht> = signal('unbekannt');

  /** Gibt an, ob die custom Geschlechtsauswahl geöffnet ist. */
  public readonly geschlechtAuswahlOffen: WritableSignal<boolean> = signal(false);

  /** Auswahloptionen für das Geschlechtsfeld. */
  public readonly geschlechtOptionen: { key: PatientGeschlecht; label: string }[] = [
    { key: 'unbekannt', label: 'Unbekannt' },
    { key: 'weiblich', label: 'Weiblich' },
    { key: 'maennlich', label: 'Männlich' },
    { key: 'divers', label: 'Divers' }
  ];

  /** Eingabe Notiz. */
  public readonly neueNotiz: WritableSignal<string> = signal('');

  /** Filteroptionen der Patientensuche. */
  public readonly filterOptionen: { key: PatientQuelle | 'alle' | 'review'; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'review', label: 'Review offen' },
    { key: 'demo', label: 'Demo' },
    { key: 'verlauf', label: 'Verlauf' },
    { key: 'ocr', label: 'OCR' },
    { key: 'manuell', label: 'Manuell' }
  ];

  /** Sortieroptionen der Patientenliste. */
  public readonly sortierOptionen: { key: PatientenSortierung; label: string }[] = [
    { key: 'aktualisiert', label: 'zuletzt aktualisiert' },
    { key: 'review', label: 'offene Reviews' },
    { key: 'name', label: 'Name' }
  ];

  /** Öffnet das Anlage-Modal. */
  public modalOeffnen(): void {
    this.bearbeiteterPatient.set(null);
    this.formularLeeren();
    this.modalOffen.set(true);
  }

  /** Öffnet das Bearbeitungsmodal und füllt das Formular. */
  public patientBearbeiten(patient: Patient): void {
    this.bearbeiteterPatient.set(patient);
    this.formularMitPatientFuellen(patient);
    this.modalOffen.set(true);
  }

  /** Schließt das Anlage- oder Bearbeitungsmodal. */
  public modalSchliessen(): void {
    this.modalOffen.set(false);
    this.bearbeiteterPatient.set(null);
    this.geschlechtAuswahlOffen.set(false);
  }

  /** Aktualisiert die globale Patientensuche. */
  public sucheSetzen(wert: string): void {
    this.patientContext.patientenSucheSetzen(wert);
  }

  /** Setzt den Quellenfilter. */
  public filterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /** Setzt die Sortierung. */
  public sortierungSetzen(sortierung: PatientenSortierung): void {
    this.sortierung.set(sortierung);
  }

  /** Liefert sortierte Testpersonen. */
  public sichtbarePatienten(): Patient[] {
    const patienten = [...this.patientContext.gefiltertePatienten()];

    if (this.sortierung() === 'review') {
      return patienten.sort((a: Patient, b: Patient) => b.offeneReviews - a.offeneReviews);
    }

    if (this.sortierung() === 'name') {
      return patienten.sort((a: Patient, b: Patient) => a.name.localeCompare(b.name));
    }

    return patienten.sort((a: Patient, b: Patient) => b.befunde - a.befunde);
  }

  /** Setzt einen Patienten als aktiven Arbeitskontext. */
  public patientAuswaehlen(patient: Patient): void {
    this.patientContext.patientSetzen(patient);
  }

  /** Aktualisiert den Vornamen. */
  public vornameAendern(event: Event): void {
    this.neuerVorname.set(this.eingabewert(event).slice(0, 40));
  }

  /** Aktualisiert den Nachnamen. */
  public nachnameAendern(event: Event): void {
    this.neuerNachname.set(this.eingabewert(event).slice(0, 40));
  }

  /** Aktualisiert die Testpersonen-ID. */
  public nummerAendern(event: Event): void {
    this.neueNummer.set(this.eingabewert(event).slice(0, 32));
  }

  /** Aktualisiert das Geburtsdatum. */
  public geburtsdatumAendern(event: Event): void {
    this.neuesGeburtsdatum.set(this.eingabewert(event).replace(/[^\d.-]/g, '').slice(0, 10));
  }

  /** Aktualisiert das Gewicht. */
  public gewichtAendern(event: Event): void {
    this.neuesGewicht.set(this.eingabewert(event).replace(/[^\d,.]/g, '').slice(0, 6));
  }

  /** Aktualisiert die Größe. */
  public groesseAendern(event: Event): void {
    this.neueGroesse.set(this.eingabewert(event).replace(/\D/g, '').slice(0, 3));
  }

  /** Aktualisiert den Lebensstil. */
  public lebensstilAendern(event: Event): void {
    this.neuerLebensstil.set(this.eingabewert(event).slice(0, 140));
  }

  /** Schaltet Nichtraucherstatus für das Formular. */
  public nichtrauchenUmschalten(): void {
    this.neuesNichtrauchen.update((wert: boolean) => !wert);
  }

  /** Schaltet Alkoholstatus für das Formular. */
  public alkoholUmschalten(): void {
    this.neuerAlkohol.update((wert: boolean) => !wert);
  }

  /** Schaltet Drogenstatus für das Formular. */
  public drogenUmschalten(): void {
    this.neueDrogen.update((wert: boolean) => !wert);
  }

  /** Öffnet oder schließt die custom Geschlechtsauswahl. */
  public geschlechtAuswahlUmschalten(): void {
    this.geschlechtAuswahlOffen.update((wert: boolean) => !wert);
  }

  /** Setzt das Geschlecht über die custom Auswahl. */
  public geschlechtSetzen(geschlecht: PatientGeschlecht): void {
    this.neuesGeschlecht.set(geschlecht);
    this.geschlechtAuswahlOffen.set(false);
  }

  /** Gibt das sichtbare Label eines Geschlechtswerts zurück. */
  public geschlechtLabel(geschlecht: PatientGeschlecht): string {
    return this.geschlechtOptionen.find((option) => option.key === geschlecht)?.label ?? 'Unbekannt';
  }

  /** Aktualisiert die Notiz. */
  public notizAendern(event: Event): void {
    this.neueNotiz.set(this.eingabewert(event).slice(0, 180));
  }

  /** Speichert eine neue oder bestehende Testperson über die API und setzt sie optional aktiv. */
  public patientSpeichern(aktivSetzen: boolean): void {
    const patient = this.bearbeiteterPatient();
    const request$ = patient
      ? this.patientContext.patientAktualisieren(patient.id, this.neuerPatientInput())
      : this.patientContext.patientAnlegen(this.neuerPatientInput());

    request$.subscribe({
      next: (gespeicherterPatient: Patient) => {
        if (aktivSetzen || patient?.id === this.patientContext.aktiverPatient().id) {
          this.patientContext.patientSetzen(gespeicherterPatient);
        }

        this.formularLeeren();
        this.modalSchliessen();
        this.toastService.zeige(patient ? 'Testperson aktualisiert' : 'Testperson angelegt', `${gespeicherterPatient.name} wurde in der Datenbank gespeichert.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Speichern fehlgeschlagen', 'Die Testperson konnte nicht in der API gespeichert werden.', 'danger');
      }
    });
  }

  /** Öffnet die Löschbestätigung für eine Testperson. */
  public patientLoeschenAnfragen(patient: Patient): void {
    this.patientZumLoeschen.set(patient);
  }

  /** Bricht die Löschbestätigung ab. */
  public patientLoeschenAbbrechen(): void {
    this.patientZumLoeschen.set(null);
  }

  /** Löscht eine Testperson nach Bestätigung aus der Datenbank. */
  public patientLoeschen(): void {
    const patient = this.patientZumLoeschen();

    if (!patient) {
      return;
    }

    this.patientContext.patientLoeschen(patient.id).subscribe({
      next: () => {
        this.patientZumLoeschen.set(null);
        this.toastService.zeige('Testperson gelöscht', `${patient.name} wurde entfernt.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Löschen fehlgeschlagen', 'Die Testperson konnte nicht gelöscht werden.', 'danger');
      }
    });
  }

  /** Gibt an, ob das Formular eine bestehende Testperson bearbeitet. */
  public istEditModus(): boolean {
    return !!this.bearbeiteterPatient();
  }

  /** Gibt eine Statusklasse zurück. */
  public statusKlasse(status: PatientStatus): string {
    return `is-${status}`;
  }

  /** Gibt ein Statuslabel zurück. */
  public statusLabel(status: PatientStatus): string {
    const labels = {
      aktiv: 'Aktiv',
      review: 'Review offen',
      import: 'Import läuft',
      bericht: 'Bericht',
      leer: 'Keine Befunde'
    };

    return labels[status];
  }

  /** Erstellt die aktuelle Eingabestruktur. */
  private neuerPatientInput(): NeuerPatientInput {
    return {
      vorname: this.neuerVorname(),
      nachname: this.neuerNachname(),
      nummer: this.neueNummer(),
      geburtsdatum: this.geburtsdatumFuerApi(this.neuesGeburtsdatum()),
      geschlecht: this.neuesGeschlecht(),
      gewichtKg: this.zahlOderNull(this.neuesGewicht()),
      groesseCm: this.zahlOderNull(this.neueGroesse()),
      lebensstil: this.neuerLebensstil(),
      nichtrauchen: this.neuesNichtrauchen(),
      alkohol: this.neuerAlkohol(),
      drogen: this.neueDrogen(),
      notiz: this.neueNotiz()
    };
  }

  /** Füllt das Formular mit bestehenden Patientendaten. */
  private formularMitPatientFuellen(patient: Patient): void {
    this.neuerVorname.set(patient.vorname);
    this.neuerNachname.set(patient.nachname);
    this.neueNummer.set(patient.nummer);
    this.neuesGeburtsdatum.set(patient.geburtsdatum);
    this.neuesGewicht.set(patient.gewichtKg?.toString() ?? '');
    this.neueGroesse.set(patient.groesseCm?.toString() ?? '');
    this.neuerLebensstil.set(patient.lebensstil);
    this.neuesNichtrauchen.set(patient.nichtrauchen);
    this.neuerAlkohol.set(patient.alkohol);
    this.neueDrogen.set(patient.drogen);
    this.neuesGeschlecht.set(patient.geschlecht);
    this.geschlechtAuswahlOffen.set(false);
    this.neueNotiz.set(patient.notiz);
  }

  /** Leert das Modalformular. */
  private formularLeeren(): void {
    this.neuerVorname.set('');
    this.neuerNachname.set('');
    this.neueNummer.set('');
    this.neuesGeburtsdatum.set('');
    this.neuesGewicht.set('');
    this.neueGroesse.set('');
    this.neuerLebensstil.set('');
    this.neuesNichtrauchen.set(false);
    this.neuerAlkohol.set(false);
    this.neueDrogen.set(false);
    this.neuesGeschlecht.set('unbekannt');
    this.geschlechtAuswahlOffen.set(false);
    this.neueNotiz.set('');
  }

  /** Normalisiert deutsche und ISO-Datumswerte für die Backend-API. */
  private geburtsdatumFuerApi(wert: string): string {
    const datum = wert.trim();
    const deutscherTreffer = datum.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

    if (deutscherTreffer) {
      return `${deutscherTreffer[3]}-${deutscherTreffer[2]}-${deutscherTreffer[1]}`;
    }

    return datum;
  }

  /** Wandelt Texteingaben in Zahlen oder null um. */
  private zahlOderNull(wert: string): number | null {
    const zahl = Number.parseFloat(wert.replace(',', '.'));
    return Number.isFinite(zahl) ? zahl : null;
  }

  /** Liest einen sicheren Eingabewert. */
  private eingabewert(event: Event): string {
    const eingabe = event.target as HTMLInputElement | HTMLTextAreaElement;
    return eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '');
  }
}
