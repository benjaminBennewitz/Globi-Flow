/* src/app/shared/components/app-navigation/app-navigation.component.ts */

/**
 * @file Rendert Sidebar, Topbar und Header-Overlays.
 * @module AppNavigationComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PatientQuelle } from '../../../core/models/patient.model';
import { PatientContextService } from '../../../core/services/patient-context.service';
import { IconActionComponent } from '../icon-action/icon-action.component';
import { SecureSearchComponent } from '../secure-search/secure-search.component';

/** Hauptnavigation mit eigenständigen Routen und Overlays. */
@Component({
  selector: 'dd-app-navigation',
  imports: [IconActionComponent, RouterLink, RouterLinkActive, SecureSearchComponent],
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

  /** Öffnet ein Header-Overlay. */
  public modalOeffnen(modal: 'alarm' | 'settings' | 'patient'): void {
    this.aktivesModal = modal;
  }

  /** Schließt das aktive Header-Overlay. */
  public modalSchliessen(): void {
    this.aktivesModal = null;
  }

  /** Setzt den Topbar-Suchbegriff. */
  public suchwertSetzen(wert: string): void {
    this.suchbegriff.set(wert);
  }

  /** Aktualisiert die globale Patientensuche. */
  public patientSucheSetzen(wert: string): void {
    this.patientContext.patientenSucheSetzen(wert);
  }

  /** Setzt den globalen Patientenfilter. */
  public patientFilterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /** Verhindert den Formularreload bei der späteren globalen Suche. */
  public sucheAbsenden(event: Event): void {
    event.preventDefault();
  }
}
