/* src/app/pages/patienten-page/patienten-page.component.ts */

/**
 * @file Routenseite zur Verwaltung zentraler Testpersonen.
 * @module PatientenPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeuerPatientInput, Patient, PatientGeschlecht, PatientQuelle, PatientStatus } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';
import { bereinigeSichereEingabe } from '../../core/security/sichere-eingabe.util';
import { IconActionComponent } from '../../shared/components/icon-action/icon-action.component';
import { SecureSearchComponent } from '../../shared/components/secure-search/secure-search.component';
import { ToastService } from '../../shared/services/toast.service';
import {
  PatientenSortierung, geburtsdatumFuerApiNormalisieren, patientenGeschlechtLabel, patientenSortieren, patientenStatusKlasse,
  patientenStatusLabel, sichererEingabewert, zahlOderNullErmitteln
} from './patienten-page-logik';

/** Schlüssel und sichtbare Bezeichnung einer Auswahloption. */
type Auswahloption<T> = { key: T; label: string };

/** Route `/patienten` für Testpersonen, Befunde und globale Auswahl. */
@Component({
  selector: 'gf-patienten-page',
  imports: [IconActionComponent, RouterLink, SecureSearchComponent],
  templateUrl: './patienten-page.component.html',
  styleUrl: './patienten-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientenPageComponent {
  public readonly patientContext = inject(PatientContextService);  // Globaler Patientenkontext.

  private readonly toastService = inject(ToastService);            // Toast-Service für API-Rückmeldungen.

  public readonly modalOffen: WritableSignal<boolean> = signal(false);                       // Zustand des Anlage- oder Bearbeitungsmodals.
  public readonly bearbeiteterPatient: WritableSignal<Patient | null> = signal(null);        // Aktuell bearbeitete Testperson.
  public readonly patientZumLoeschen: WritableSignal<Patient | null> = signal(null);         // Testperson der Löschbestätigung.
  public readonly sortierung: WritableSignal<PatientenSortierung> = signal('aktualisiert');  // Aktive Listensortierung.
  public readonly neuerVorname: WritableSignal<string> = signal('');                         // Formulareingabe Vorname.
  public readonly neuerNachname: WritableSignal<string> = signal('');                        // Formulareingabe Nachname.
  public readonly neueNummer: WritableSignal<string> = signal('');                           // Formulareingabe Testpersonen-ID.
  public readonly neuesGeburtsdatum: WritableSignal<string> = signal('');                    // Formulareingabe Geburtsdatum.
  public readonly neuesGewicht: WritableSignal<string> = signal('');                         // Formulareingabe Gewicht.
  public readonly neueGroesse: WritableSignal<string> = signal('');                          // Formulareingabe Körpergröße.
  public readonly neuerLebensstil: WritableSignal<string> = signal('');                      // Formulareingabe Lebensstil.
  public readonly neuesNichtrauchen: WritableSignal<boolean> = signal(false);                // Nichtraucherstatus des Formulars.
  public readonly neuerAlkohol: WritableSignal<boolean> = signal(false);                     // Dokumentierter Alkoholkonsum.
  public readonly neueDrogen: WritableSignal<boolean> = signal(false);                       // Dokumentierter Drogenkonsum.
  public readonly neuesGeschlecht: WritableSignal<PatientGeschlecht> = signal('unbekannt');  // Formulareingabe Geschlecht.
  public readonly geschlechtAuswahlOffen: WritableSignal<boolean> = signal(false);           // Zustand der Geschlechtsauswahl.
  public readonly neueNotiz: WritableSignal<string> = signal('');                            // Formulareingabe Notiz.

  /** Auswahloptionen des Geschlechtsfelds. */
  public readonly geschlechtOptionen: Auswahloption<PatientGeschlecht>[] = [
    { key: 'unbekannt', label: 'Unbekannt' },
    { key: 'weiblich', label: 'Weiblich' },
    { key: 'maennlich', label: 'Männlich' },
    { key: 'divers', label: 'Divers' }
  ];

  /** Filteroptionen der Patientensuche. */
  public readonly filterOptionen: Auswahloption<PatientQuelle | 'alle' | 'review'>[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'review', label: 'Review offen' },
    { key: 'demo', label: 'Demo' },
    { key: 'verlauf', label: 'Verlauf' },
    { key: 'ocr', label: 'OCR' },
    { key: 'manuell', label: 'Manuell' }
  ];

  /** Sortieroptionen der Patientenliste. */
  public readonly sortierOptionen: Auswahloption<PatientenSortierung>[] = [
    { key: 'aktualisiert', label: 'zuletzt aktualisiert' },
    { key: 'review', label: 'offene Reviews' },
    { key: 'name', label: 'Name' }
  ];

  /** Öffnet das Modal zur Anlage einer neuen Testperson. */
  public modalOeffnen(): void {
    this.bearbeiteterPatient.set(null);
    this.formularLeeren();
    this.modalOffen.set(true);
  }

  /**
   * Öffnet das Bearbeitungsmodal und übernimmt bestehende Patientendaten.
   *
   * @param patient Zu bearbeitende Testperson.
   */
  public patientBearbeiten(patient: Patient): void {
    this.bearbeiteterPatient.set(patient);
    this.formularMitPatientFuellen(patient);
    this.modalOffen.set(true);
  }

  /** Schließt das aktive Formularmodal und verwirft den Bearbeitungskontext. */
  public modalSchliessen(): void {
    this.modalOffen.set(false);
    this.bearbeiteterPatient.set(null);
    this.geschlechtAuswahlOffen.set(false);
  }

  /**
   * Aktualisiert die globale Patientensuche.
   *
   * @param wert Bereinigter Suchwert der Suchkomponente.
   */
  public sucheSetzen(wert: string): void {
    this.patientContext.patientenSucheSetzen(wert);
  }

  /**
   * Setzt den aktiven Quellen- oder Reviewfilter.
   *
   * @param filter Gewählter Filter der Patientenliste.
   */
  public filterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /**
   * Setzt das Sortierkriterium der sichtbaren Testpersonen.
   *
   * @param sortierung Gewünschtes Sortierkriterium.
   */
  public sortierungSetzen(sortierung: PatientenSortierung): void {
    this.sortierung.set(sortierung);
  }

  /**
   * Liefert die gefilterten Testpersonen in der aktuell gewählten Reihenfolge.
   *
   * @returns Neu sortierte Patientenliste.
   */
  public sichtbarePatienten(): Patient[] {
    return patientenSortieren(this.patientContext.gefiltertePatienten(), this.sortierung());
  }

  /**
   * Setzt eine Testperson als globalen Arbeitskontext.
   *
   * @param patient Ausgewählte Testperson.
   */
  public patientAuswaehlen(patient: Patient): void {
    this.patientContext.patientSetzen(patient);
  }

  /** @param event Eingabeereignis des Vornamenfelds. */
  public vornameAendern(event: Event): void {
    this.neuerVorname.set(bereinigeSichereEingabe(sichererEingabewert(event), 'name', 40));
  }

  /** @param event Eingabeereignis des Nachnamenfelds. */
  public nachnameAendern(event: Event): void {
    this.neuerNachname.set(bereinigeSichereEingabe(sichererEingabewert(event), 'name', 40));
  }

  /** @param event Eingabeereignis des Nummernfelds. */
  public nummerAendern(event: Event): void {
    this.neueNummer.set(bereinigeSichereEingabe(sichererEingabewert(event), 'schluessel', 32));
  }

  /** @param event Eingabeereignis des Geburtsdatums. */
  public geburtsdatumAendern(event: Event): void {
    this.neuesGeburtsdatum.set(sichererEingabewert(event).replace(/[^\d.-]/g, '').slice(0, 10));
  }

  /** @param event Eingabeereignis des Gewichtsfelds. */
  public gewichtAendern(event: Event): void {
    this.neuesGewicht.set(sichererEingabewert(event).replace(/[^\d,.]/g, '').slice(0, 6));
  }

  /** @param event Eingabeereignis des Größenfelds. */
  public groesseAendern(event: Event): void {
    this.neueGroesse.set(sichererEingabewert(event).replace(/\D/g, '').slice(0, 3));
  }

  /** @param event Eingabeereignis des Lebensstilfelds. */
  public lebensstilAendern(event: Event): void {
    this.neuerLebensstil.set(bereinigeSichereEingabe(sichererEingabewert(event), 'freitext', 140));
  }

  /** Kehrt den Nichtraucherstatus des Formulars um. */
  public nichtrauchenUmschalten(): void {
    this.neuesNichtrauchen.update((wert: boolean) => !wert);
  }

  /** Kehrt den dokumentierten Alkoholstatus des Formulars um. */
  public alkoholUmschalten(): void {
    this.neuerAlkohol.update((wert: boolean) => !wert);
  }

  /** Kehrt den dokumentierten Drogenstatus des Formulars um. */
  public drogenUmschalten(): void {
    this.neueDrogen.update((wert: boolean) => !wert);
  }

  /** Öffnet oder schließt die benutzerdefinierte Geschlechtsauswahl. */
  public geschlechtAuswahlUmschalten(): void {
    this.geschlechtAuswahlOffen.update((wert: boolean) => !wert);
  }

  /**
   * Übernimmt ein Geschlecht und schließt die Auswahl.
   *
   * @param geschlecht Gewählter Geschlechtswert.
   */
  public geschlechtSetzen(geschlecht: PatientGeschlecht): void {
    this.neuesGeschlecht.set(geschlecht);
    this.geschlechtAuswahlOffen.set(false);
  }

  /**
   * Ermittelt die sichtbare Bezeichnung eines Geschlechtswerts.
   *
   * @param geschlecht Fachlicher Geschlechtswert.
   * @returns Deutsche Geschlechtsbezeichnung.
   */
  public geschlechtLabel(geschlecht: PatientGeschlecht): string {
    return patientenGeschlechtLabel(geschlecht);
  }

  /** @param event Eingabeereignis des Notizfelds. */
  public notizAendern(event: Event): void {
    this.neueNotiz.set(bereinigeSichereEingabe(sichererEingabewert(event), 'freitext', 180));
  }

  /**
   * Erstellt oder aktualisiert eine Testperson über die API.
   *
   * @param aktivSetzen Gibt an, ob die gespeicherte Testperson aktiviert werden soll.
   */
  public patientSpeichern(aktivSetzen: boolean): void {
    const patient: Patient | null = this.bearbeiteterPatient(); // Bestehender Bearbeitungskontext.
    const request$ = patient ? this.patientContext.patientAktualisieren(patient.id, this.neuerPatientInput()) : this.patientContext.patientAnlegen(this.neuerPatientInput()); // Passender API-Request.

    request$.subscribe({
      next: (gespeicherterPatient: Patient) => {
        if (aktivSetzen || patient?.id === this.patientContext.aktiverPatient().id) {
          this.patientContext.patientSetzen(gespeicherterPatient);
        }

        this.formularLeeren();
        this.modalSchliessen();
        this.toastService.zeige(patient ? 'Testperson aktualisiert' : 'Testperson angelegt', `${gespeicherterPatient.name} wurde in der Datenbank gespeichert.`, 'success');
      },
      error: () => this.toastService.zeige('Speichern fehlgeschlagen', 'Die Testperson konnte nicht in der API gespeichert werden.', 'danger')
    });
  }

  /** @param patient Testperson, deren Löschung bestätigt werden soll. */
  public patientLoeschenAnfragen(patient: Patient): void {
    this.patientZumLoeschen.set(patient);
  }

  /** Schließt die Löschbestätigung ohne Datenänderung. */
  public patientLoeschenAbbrechen(): void {
    this.patientZumLoeschen.set(null);
  }

  /** Löscht die ausgewählte Testperson nach Bestätigung über die API. */
  public patientLoeschen(): void {
    const patient: Patient | null = this.patientZumLoeschen(); // Testperson der aktiven Löschbestätigung.

    if (!patient) {
      return;
    }

    this.patientContext.patientLoeschen(patient.id).subscribe({
      next: () => {
        this.patientZumLoeschen.set(null);
        this.toastService.zeige('Testperson gelöscht', `${patient.name} wurde entfernt.`, 'success');
      },
      error: () => this.toastService.zeige('Löschen fehlgeschlagen', 'Die Testperson konnte nicht gelöscht werden.', 'danger')
    });
  }

  /** @returns `true`, wenn eine bestehende Testperson bearbeitet wird. */
  public istEditModus(): boolean {
    return this.bearbeiteterPatient() !== null;
  }

  /** @param status Patientenstatus. @returns Zugehörige CSS-Modifikatorklasse. */
  public statusKlasse(status: PatientStatus): string {
    return patientenStatusKlasse(status);
  }

  /** @param status Patientenstatus. @returns Sichtbare deutsche Statusbezeichnung. */
  public statusLabel(status: PatientStatus): string {
    return patientenStatusLabel(status);
  }

  /** @returns Vollständige API-Eingabestruktur aus dem aktuellen Formularzustand. */
  private neuerPatientInput(): NeuerPatientInput {
    return {
      vorname: this.neuerVorname(),
      nachname: this.neuerNachname(),
      nummer: this.neueNummer(),
      geburtsdatum: geburtsdatumFuerApiNormalisieren(this.neuesGeburtsdatum()),
      geschlecht: this.neuesGeschlecht(),
      gewichtKg: zahlOderNullErmitteln(this.neuesGewicht()),
      groesseCm: zahlOderNullErmitteln(this.neueGroesse()),
      lebensstil: this.neuerLebensstil(),
      nichtrauchen: this.neuesNichtrauchen(),
      alkohol: this.neuerAlkohol(),
      drogen: this.neueDrogen(),
      notiz: this.neueNotiz()
    };
  }

  /** @param patient Testperson, deren Werte in das Formular übernommen werden. */
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

  /** Setzt sämtliche Felder des Patientenformulars auf ihre Ausgangswerte zurück. */
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
}
