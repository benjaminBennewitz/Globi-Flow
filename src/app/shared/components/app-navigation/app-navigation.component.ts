/* src/app/shared/components/app-navigation/app-navigation.component.ts */

/**
 * @file Rendert Sidebar, Topbar und Header-Overlays.
 * @module AppNavigationComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PatientQuelle } from '../../../core/models/patient.model';
import { normalisiereSichereSuche, SICHERE_SUCHE_MAX_LAENGE } from '../../../core/security/sichere-suche.util';
import { PatientContextService } from '../../../core/services/patient-context.service';

/** Hauptnavigation mit eigenständigen Routen und Overlays. */
@Component({
  selector: 'dd-app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-navigation.component.html',
  styleUrl: './app-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavigationComponent {
  /** Aktuell geöffnetes Header-Overlay. */
  public aktivesModal: 'alarm' | 'settings' | 'patient' | null = null;

  /** Globaler Patientenkontext für alle Routen. */
  public readonly patientContext = inject(PatientContextService);

  /** Aktueller bereinigter Suchbegriff. */
  public readonly suchbegriff: WritableSignal<string> = signal('');

  /** Aktuelle Suchfeldmeldung. */
  public readonly suchMeldung: WritableSignal<string> = signal('');

  /** Gibt an, ob der aktuelle Suchbegriff blockiert ist. */
  public readonly sucheBlockiert: WritableSignal<boolean> = signal(false);

  /** Maximale Suchfeldlänge für Template-Attribute. */
  public readonly suchMaxLaenge = SICHERE_SUCHE_MAX_LAENGE;

  /** Öffnet ein Header-Overlay. */
  public modalOeffnen(modal: 'alarm' | 'settings' | 'patient'): void {
    this.aktivesModal = modal;
  }

  /** Schließt das aktive Header-Overlay. */
  public modalSchliessen(): void {
    this.aktivesModal = null;
  }

  /** Bereinigt Suchfeldeingaben sofort im Frontend. */
  public suchwertAendern(event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const ergebnis = normalisiereSichereSuche(eingabe.value);

    eingabe.value = ergebnis.wert;
    this.suchbegriff.set(ergebnis.wert);
    this.sucheBlockiert.set(!ergebnis.istGueltig && !!ergebnis.meldung);
    this.suchMeldung.set(ergebnis.meldung);
  }

  /** Aktualisiert die globale Patientensuche. */
  public patientSucheAendern(event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    this.patientContext.patientenSucheSetzen(eingabe.value);
    eingabe.value = this.patientContext.patientenSuche();
  }

  /** Setzt den globalen Patientenfilter. */
  public patientFilterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /** Verhindert unsichere oder leere Suchanfragen vor API-Nutzung. */
  public sucheAbsenden(event: Event): void {
    event.preventDefault();

    const ergebnis = normalisiereSichereSuche(this.suchbegriff());

    if (!ergebnis.istGueltig || !ergebnis.wert.trim()) {
      this.sucheBlockiert.set(!!ergebnis.meldung);
      this.suchMeldung.set(ergebnis.meldung);
      return;
    }

    this.sucheBlockiert.set(false);
    this.suchMeldung.set('Suche vorbereitet.');
  }
}
