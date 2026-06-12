/* src/app/pages/patienten-page/patienten-page.component.ts */

/**
 * @file Routenseite zur Verwaltung zentraler Testpersonen.
 * @module PatientenPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeuerPatientInput, Patient, PatientGeschlecht, PatientQuelle, PatientStatus } from '../../core/models/patient.model';
import { normalisiereSichereSuche } from '../../core/security/sichere-suche.util';
import { PatientContextService } from '../../core/services/patient-context.service';

/** Sortieroptionen der Patientenliste. */
type PatientenSortierung = 'aktualisiert' | 'review' | 'name';

/** Route `/patienten` für Testpersonen, Befunde und globale Auswahl. */
@Component({
  selector: 'dd-patienten-page',
  imports: [RouterLink],
  templateUrl: './patienten-page.component.html',
  styleUrl: './patienten-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientenPageComponent {
  /** Globaler Patientenkontext. */
  public readonly patientContext = inject(PatientContextService);

  /** Gibt an, ob das Anlage-Modal geöffnet ist. */
  public readonly modalOffen: WritableSignal<boolean> = signal(false);

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

  /** Rückmeldung zur sicheren Suche. */
  public readonly suchFeedback: WritableSignal<string> = signal('');

  /** Eingabe Geschlecht. */
  public readonly neuesGeschlecht: WritableSignal<PatientGeschlecht> = signal('unbekannt');

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
    this.modalOffen.set(true);
  }

  /** Schließt das Anlage-Modal. */
  public modalSchliessen(): void {
    this.modalOffen.set(false);
  }

  /** Aktualisiert die globale Patientensuche mit der zentralen Sicherheitsnormalisierung. */
  public sucheAendern(event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const ergebnis = normalisiereSichereSuche(eingabe.value);

    this.patientContext.patientenSucheSetzen(ergebnis.wert);
    this.suchFeedback.set(ergebnis.meldung ?? '');
    eingabe.value = this.patientContext.patientenSuche();
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
    this.neuesGeburtsdatum.set(this.eingabewert(event).replace(/[^\d-]/g, '').slice(0, 10));
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

  /** Aktualisiert das Geschlecht. */
  public geschlechtAendern(event: Event): void {
    const eingabe = event.target as HTMLSelectElement;
    this.neuesGeschlecht.set(eingabe.value as PatientGeschlecht);
  }

  /** Aktualisiert die Notiz. */
  public notizAendern(event: Event): void {
    this.neueNotiz.set(this.eingabewert(event).slice(0, 180));
  }

  /** Erstellt eine Testperson und setzt sie optional aktiv. */
  public patientAnlegen(aktivSetzen: boolean): void {
    const patient = this.patientContext.patientAnlegen(this.neuerPatientInput());

    if (aktivSetzen) {
      this.patientContext.patientSetzen(patient);
    }

    this.formularLeeren();
    this.modalSchliessen();
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
      geburtsdatum: this.neuesGeburtsdatum(),
      geschlecht: this.neuesGeschlecht(),
      gewichtKg: this.zahlOderNull(this.neuesGewicht()),
      groesseCm: this.zahlOderNull(this.neueGroesse()),
      lebensstil: this.neuerLebensstil(),
      notiz: this.neueNotiz()
    };
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
    this.neuesGeschlecht.set('unbekannt');
    this.neueNotiz.set('');
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

