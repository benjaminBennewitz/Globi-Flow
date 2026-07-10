/* src/app/shared/components/app-navigation/app-navigation.component.ts */

/**
 * @file Rendert Sidebar, Topbar, globale Suche und Header-Overlays.
 * @module AppNavigationComponent
 */

import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobaleSuchergebnis, GlobaleSuchgruppe } from '../../../core/models/globale-suche.model';
import { PatientQuelle } from '../../../core/models/patient.model';
import { GlobiFlowApiService } from '../../../core/services/globi-flow-api.service';
import { PatientContextService } from '../../../core/services/patient-context.service';
import { IconActionComponent } from '../icon-action/icon-action.component';
import { SecureSearchComponent } from '../secure-search/secure-search.component';
import { ToastService } from '../../services/toast.service';
import { suchfokusStyleBereitstellen, suchtrefferMarkieren } from './app-navigation-suchfokus';

/** Hauptnavigation mit eigenständigen Routen, globaler Suche und Overlays. */
@Component({
  selector: 'gf-app-navigation',
  imports: [IconActionComponent, RouterLink, RouterLinkActive, SecureSearchComponent],
  templateUrl: './app-navigation.component.html',
  styleUrl: './app-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavigationComponent implements OnDestroy {
  private readonly dokument = inject(DOCUMENT);                        // Dokumentreferenz für globale Layout-Tokens.
  private readonly globiFlowApi = inject(GlobiFlowApiService);         // API-Service für die globale Backend-Suche.
  private readonly router = inject(Router);                            // Router für die Navigation zu Suchtreffern.
  private readonly toastService = inject(ToastService);                // Toast-Service für Rückmeldungen.
  public readonly patientContext = inject(PatientContextService);      // Globaler Patientenkontext für alle Routen.

  public readonly navigationEingeklappt = signal(false);               // Gibt an, ob die Sidebar auf Icons reduziert ist.
  public aktivesModal: 'alarm' | 'settings' | 'patient' | null = null; // Aktuell geöffnetes Header-Overlay.

  public readonly suchbegriff = signal('');                            // Aktueller bereinigter Suchbegriff.
  public readonly suchgruppen = signal<GlobaleSuchgruppe[]>([]);       // Treffergruppen der globalen Suche.
  public readonly sucheLaedt = signal(false);                          // Gibt an, ob die globale Suche lädt.
  public readonly suchmeldung = signal('');                            // Rückmeldung der globalen Suche.
  public readonly suchFokusLabel = signal('');                         // Aktueller visueller Suchfokus.

  /** Suchergebnis, das vor der Navigation einen Patientenkontextwechsel benötigt. */
  public readonly patientenwechselTreffer = signal<GlobaleSuchergebnis | null>(null);

  public readonly demoResetBestaetigungSichtbar = signal(false);       // Sichtbarkeit der Bestätigung für den Demo-Reset.
  public readonly demoResetLaedt = signal(false);                      // Gibt an, ob der Demo-Reset gerade läuft.
  public readonly demoResetFehler = signal('');                        // Fehlermeldung des Demo-Resets.

  /** Gibt an, ob die globale Trefferbox angezeigt werden soll. */
  public readonly suchergebnisseSichtbar = computed(
    () =>
      this.suchbegriff().trim().length >= 2 &&
      (
        this.sucheLaedt() ||
        !!this.suchmeldung() ||
        this.suchgruppen().length > 0
      ),
  );

  private suchTimerId: ReturnType<typeof setTimeout> | null = null;     // Timer für das Debouncing der Header-Suche.
  private suchAbo: Subscription | null = null;                         // Aktives Abonnement der globalen Suchanfrage.                                                                                                                                  // Aktives Suchabo.


  /**
   * Initialisiert die globale Suchhervorhebung und synchronisiert die Sidebarbreite.
   */
  public constructor() {
    suchfokusStyleBereitstellen(this.dokument);

    effect(() => {
      const breite = this.navigationEingeklappt() ? 'var(--gf-sidebar-collapsed-width)' : 'var(--gf-sidebar-width)'; // Aktuell wirksame Breite der Sidebar.
      this.dokument.documentElement.style.setProperty('--gf-sidebar-current-width', breite);
    });
  }

  /**
   * Räumt den Debounce-Timer und das aktive Suchabo beim Zerstören der Komponente auf.
   */
  public ngOnDestroy(): void {
    if (this.suchTimerId) {
      clearTimeout(this.suchTimerId);
    }

    this.suchAbo?.unsubscribe();
  }

  /**
   * Schaltet die Sidebar zwischen vollständiger Navigation und kompakter Iconansicht um.
   */
  public navigationUmschalten(): void {
    this.navigationEingeklappt.update((wert: boolean) => !wert);
  }

  /**
   * Öffnet das ausgewählte Header-Overlay.
   *
   * @param modal Technischer Schlüssel des zu öffnenden Overlays.
   */
  public modalOeffnen(modal: 'alarm' | 'settings' | 'patient'): void {
    this.aktivesModal = modal;
  }

  /**
   * Schließt das aktuell geöffnete Header-Overlay.
   */
  public modalSchliessen(): void {
    this.aktivesModal = null;
  }

  /**
   * Übernimmt den bereinigten Suchwert und plant die globale Backend-Suche.
   *
   * @param wert Aktueller Wert des Suchfelds.
   */
  public suchwertSetzen(wert: string): void {
    this.suchbegriff.set(wert);
    this.globaleSuchePlanen(wert);
  }

  /**
   * Aktualisiert die Patientensuche im globalen Patientenkontext.
   *
   * @param wert Aktueller Suchwert der Patientenauswahl.
   */
  public patientSucheSetzen(wert: string): void {
    this.patientContext.patientenSucheSetzen(wert);
  }

  /**
   * Setzt den aktiven Quellen- oder Reviewfilter der globalen Patientenauswahl.
   *
   * @param filter Ausgewählter Patientenfilter.
   */
  public patientFilterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /**
   * Verhindert das native Absenden des Suchformulars und damit einen Seitenreload.
   *
   * @param event Submit-Ereignis des Suchformulars.
   */
  public sucheAbsenden(event: Event): void {
    event.preventDefault();
  }


  /**
   * Öffnet den Bestätigungsdialog zum Zurücksetzen der lokalen Demo-Daten.
   */
  public demoResetDialogOeffnen(): void {
    this.demoResetFehler.set('');
    this.demoResetBestaetigungSichtbar.set(true);
  }

  /**
   * Schließt den Demo-Reset-Dialog, sofern aktuell kein Reset ausgeführt wird.
   */
  public demoResetAbbrechen(): void {
    if (this.demoResetLaedt()) {
      return;
    }

    this.demoResetBestaetigungSichtbar.set(false);
    this.demoResetFehler.set('');
  }

  /**
   * Setzt die Demo-Daten über die Backend-API zurück und aktualisiert den Patientenkontext.
   */
  public demoDatenZuruecksetzen(): void {
    if (this.demoResetLaedt()) {
      return;
    }

    this.demoResetLaedt.set(true);
    this.demoResetFehler.set('');
    this.globiFlowApi.demoDatenZuruecksetzen().subscribe({
      next: (antwort) => {
        this.demoResetLaedt.set(false);
        this.demoResetBestaetigungSichtbar.set(false);
        this.patientContext.patientenNeuLaden();
        this.suchbegriff.set('');
        this.suchergebnisAuswaehlen();
        this.toastService.zeige('Demo-Daten zurückgesetzt', `${antwort.patients} Testpersonen, ${antwort.reports} Befunde und ${antwort.values} Werte wurden neu angelegt.`, 'success');
        this.router.navigate(['/uebersicht']);
      },
      error: () => {
        this.demoResetLaedt.set(false);
        this.demoResetFehler.set('Die Demo-Daten konnten nicht zurückgesetzt werden. Bitte Backend-Konsole prüfen.');
      }
    });
  }

  /**
   * Leert Treffergruppen und Rückmeldung der globalen Suche.
   */
  public suchergebnisAuswaehlen(): void {
    this.suchgruppen.set([]);
    this.suchmeldung.set('');
  }

  /**
   * Öffnet einen Suchtreffer oder fordert zuvor einen notwendigen Patientenwechsel an.
   *
   * @param ergebnis Ausgewähltes Ergebnis der globalen Suche.
   * @param event Klickereignis des Ergebnislinks.
   */
  public suchergebnisOeffnen(ergebnis: GlobaleSuchergebnis, event: Event): void {
    event.preventDefault();

    if (this.ergebnisBrauchtPatientenwechsel(ergebnis)) {
      this.patientenwechselTreffer.set(ergebnis);
      return;
    }

    this.suchergebnisNavigieren(ergebnis);
  }

  /**
   * Bestätigt den angeforderten Patientenwechsel und navigiert anschließend zum Treffer.
   */
  public patientenwechselBestaetigen(): void {
    const ergebnis = this.patientenwechselTreffer(); // Vorgemerkter Treffer für den bestätigten Kontextwechsel.

    if (!ergebnis?.patientId) {
      return;
    }

    const patient = this.patientContext.patienten().find((eintrag) => eintrag.id === ergebnis.patientId); // Zum Treffer gehörender Patient aus dem geladenen Kontext.

    if (!patient) {
      this.toastService.zeige('Patient nicht geladen', 'Der Treffer konnte keinem geladenen Patientenkontext zugeordnet werden.', 'danger');
      this.patientenwechselTreffer.set(null);
      return;
    }

    this.patientContext.patientSetzen(patient);
    this.patientenwechselTreffer.set(null);
    this.suchergebnisNavigieren(ergebnis, true);
  }

  /**
   * Verwirft den vorgemerkten Suchtreffer und bricht den Patientenwechsel ab.
   */
  public patientenwechselAbbrechen(): void {
    this.patientenwechselTreffer.set(null);
  }

  /**
   * Liefert den Anzeigenamen des aktuell aktiven Patienten.
   *
   * @returns Name des aktiven Patienten.
   */
  public aktuellerPatientName(): string {
    return this.patientContext.aktiverPatient().name;
  }

  /**
   * Erzeugt einen stabilen Track-Key für eine Ergebniszeile.
   *
   * @param ergebnis Suchergebnis, das im Template iteriert wird.
   * @returns Zusammengesetzter Schlüssel aus Badge, ID und Route.
   */
  public suchergebnisTrackKey(ergebnis: GlobaleSuchergebnis): string {
    return `${ergebnis.badge}-${ergebnis.id}-${ergebnis.route}`;
  }

  /**
   * Prüft, ob der Suchtreffer zu einem anderen als dem aktuell aktiven Patienten gehört.
   *
   * @param ergebnis Zu prüfendes globales Suchergebnis.
   * @returns `true`, wenn vor der Navigation ein Patientenwechsel erforderlich ist.
   */
  private ergebnisBrauchtPatientenwechsel(ergebnis: GlobaleSuchergebnis): boolean {
    return !!ergebnis.patientId && !!this.patientContext.aktiverPatient().id && ergebnis.patientId !== this.patientContext.aktiverPatient().id;
  }

  /**
   * Navigiert zur Zielroute und markiert das passende Zielelement nach dem Routenwechsel.
   *
   * @param ergebnis Ausgewähltes globales Suchergebnis.
   * @param patientWurdeGewechselt Gibt an, ob für das Rendern mehr Wartezeit benötigt wird.
   */
  private suchergebnisNavigieren(ergebnis: GlobaleSuchergebnis, patientWurdeGewechselt = false): void {
    this.suchbegriff.set('');
    this.suchergebnisAuswaehlen();
    const suchFokus = ergebnis.targetId || ergebnis.id; // Stabile Ziel-ID für Queryparameter und Fokusmarkierung.
    const queryParams: Record<string, string> = { suchFokus, suchLabel: ergebnis.title }; // Queryparameter für Zielroute und sichtbares Fokusfeedback.

    if (ergebnis.patientId) {
      queryParams['patient'] = ergebnis.patientId;
    }

    this.router.navigate([ergebnis.route], { queryParams }).then(() => {
      this.suchFokusLabel.set(ergebnis.title);
      window.setTimeout(() => suchtrefferMarkieren(this.dokument, ergebnis), patientWurdeGewechselt ? 520 : 320);
      window.setTimeout(() => this.suchFokusLabel.set(''), 3000);
    });
  }

  /**
   * Plant die globale Backend-Suche mit kurzem Debounce und verwirft veraltete Anfragen.
   *
   * @param wert Unverarbeiteter Wert des globalen Suchfelds.
   */
  private globaleSuchePlanen(wert: string): void {
    const query = wert.trim(); // Bereinigter Suchbegriff für Mindestlänge und API-Aufruf.

    if (this.suchTimerId) {
      clearTimeout(this.suchTimerId);
    }

    this.suchAbo?.unsubscribe();

    if (query.length < 2) {
      this.sucheLaedt.set(false);
      this.suchgruppen.set([]);
      this.suchmeldung.set('');
      return;
    }

    this.sucheLaedt.set(true);
    this.suchmeldung.set('');
    this.suchTimerId = setTimeout(() => this.globaleSucheAusfuehren(query), 260);
  }

  /**
   * Führt die globale Suche über die lokale Backend-API aus und aktualisiert den UI-Zustand.
   *
   * @param query Bereits bereinigter Suchbegriff mit mindestens zwei Zeichen.
   */
  private globaleSucheAusfuehren(query: string): void {
    this.suchAbo = this.globiFlowApi.globaleSuche(query).subscribe({
      next: (antwort) => {
        this.sucheLaedt.set(false);
        this.suchgruppen.set(antwort.groups);
        this.suchmeldung.set(antwort.total ? '' : 'Keine Treffer in Patienten, Befunden, Werten, Review, Importen, Wissen oder Berichten gefunden.');
      },
      error: () => {
        this.sucheLaedt.set(false);
        this.suchgruppen.set([]);
        this.suchmeldung.set('Die globale Suche konnte die Backend-API nicht erreichen.');
      }
    });
  }
}
