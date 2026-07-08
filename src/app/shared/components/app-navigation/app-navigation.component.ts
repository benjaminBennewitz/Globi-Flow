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

/** Hauptnavigation mit eigenständigen Routen, globaler Suche und Overlays. */
@Component({
  selector: 'gf-app-navigation',
  imports: [IconActionComponent, RouterLink, RouterLinkActive, SecureSearchComponent],
  templateUrl: './app-navigation.component.html',
  styleUrl: './app-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavigationComponent implements OnDestroy {
  /** Dokumentreferenz für globale Layout-Tokens. */
  private readonly dokument = inject(DOCUMENT);

  /** API-Service für globale Backend-Suche. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Router für Suchtreffer-Navigation. */
  private readonly router = inject(Router);

  /** Toast-Service für Suchfeedback. */
  private readonly toastService = inject(ToastService);

  /** Gibt an, ob die Sidebar auf Icons reduziert ist. */
  public readonly navigationEingeklappt: WritableSignal<boolean> = signal(false);

  /** Aktuell geöffnetes Header-Overlay. */
  public aktivesModal: 'alarm' | 'settings' | 'patient' | null = null;

  /** Globaler Patientenkontext für alle Routen. */
  public readonly patientContext = inject(PatientContextService);

  /** Aktueller bereinigter Suchbegriff. */
  public readonly suchbegriff: WritableSignal<string> = signal('');

  /** Treffergruppen der globalen Suche. */
  public readonly suchgruppen: WritableSignal<GlobaleSuchgruppe[]> = signal([]);

  /** Gibt an, ob die globale Suche lädt. */
  public readonly sucheLaedt: WritableSignal<boolean> = signal(false);

  /** Rückmeldung der globalen Suche. */
  public readonly suchmeldung: WritableSignal<string> = signal('');

  /** Suchergebnis, das vor Navigation einen Patientenkontextwechsel benötigt. */
  public readonly patientenwechselTreffer: WritableSignal<GlobaleSuchergebnis | null> = signal(null);

  /** Aktueller visueller Suchfokus. */
  public readonly suchFokusLabel: WritableSignal<string> = signal('');

  /** Sichtbarkeit der Bestätigung für den Demo-Reset. */
  public readonly demoResetBestaetigungSichtbar: WritableSignal<boolean> = signal(false);

  /** Gibt an, ob der Demo-Reset gerade läuft. */
  public readonly demoResetLaedt: WritableSignal<boolean> = signal(false);

  /** Fehlermeldung des Demo-Resets. */
  public readonly demoResetFehler: WritableSignal<string> = signal('');

  /** Sichtbarkeit der globalen Trefferbox. */
  public readonly suchergebnisseSichtbar = computed(() => this.suchbegriff().trim().length >= 2 && (this.sucheLaedt() || !!this.suchmeldung() || this.suchgruppen().length > 0));

  /** Timer für Debouncing der Header-Suche. */
  private suchTimerId: ReturnType<typeof setTimeout> | null = null;

  /** Aktives Suchabo. */
  private suchAbo: Subscription | null = null;

  /** Synchronisiert die Breite der App-Shell mit dem Sidebarzustand. */
  public constructor() {
    this.suchfokusStyleBereitstellen();

    effect(() => {
      const breite = this.navigationEingeklappt() ? 'var(--gf-sidebar-collapsed-width)' : 'var(--gf-sidebar-width)';
      this.dokument.documentElement.style.setProperty('--gf-sidebar-current-width', breite);
    });
  }

  /** Räumt laufende Suchprozesse auf. */
  public ngOnDestroy(): void {
    if (this.suchTimerId) {
      clearTimeout(this.suchTimerId);
    }

    this.suchAbo?.unsubscribe();
  }

  /** Schaltet die Sidebar zwischen Vollansicht und Iconansicht um. */
  public navigationUmschalten(): void {
    this.navigationEingeklappt.update((wert: boolean) => !wert);
  }

  /** Öffnet ein Header-Overlay. */
  public modalOeffnen(modal: 'alarm' | 'settings' | 'patient'): void {
    this.aktivesModal = modal;
  }

  /** Schließt das aktive Header-Overlay. */
  public modalSchliessen(): void {
    this.aktivesModal = null;
  }

  /** Setzt den Topbar-Suchbegriff und startet die globale Suche. */
  public suchwertSetzen(wert: string): void {
    this.suchbegriff.set(wert);
    this.globaleSuchePlanen(wert);
  }

  /** Aktualisiert die globale Patientensuche. */
  public patientSucheSetzen(wert: string): void {
    this.patientContext.patientenSucheSetzen(wert);
  }

  /** Setzt den globalen Patientenfilter. */
  public patientFilterSetzen(filter: PatientQuelle | 'alle' | 'review'): void {
    this.patientContext.patientenFilterSetzen(filter);
  }

  /** Verhindert den Formularreload und hält die Suchbox sichtbar. */
  public sucheAbsenden(event: Event): void {
    event.preventDefault();
  }


  /** Öffnet die Bestätigung zum Zurücksetzen der Demo-Daten. */
  public demoResetDialogOeffnen(): void {
    this.demoResetFehler.set('');
    this.demoResetBestaetigungSichtbar.set(true);
  }

  /** Bricht den Demo-Reset ab. */
  public demoResetAbbrechen(): void {
    if (this.demoResetLaedt()) {
      return;
    }

    this.demoResetBestaetigungSichtbar.set(false);
    this.demoResetFehler.set('');
  }

  /** Setzt die Demo-Daten im Backend zurück und lädt den Patientenkontext neu. */
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

  /** Schließt die Suchergebnisse nach einer Auswahl. */
  public suchergebnisAuswaehlen(): void {
    this.suchgruppen.set([]);
    this.suchmeldung.set('');
  }

  /** Öffnet ein Suchergebnis und prüft vorher den Patientenkontext. */
  public suchergebnisOeffnen(ergebnis: GlobaleSuchergebnis, event: Event): void {
    event.preventDefault();

    if (this.ergebnisBrauchtPatientenwechsel(ergebnis)) {
      this.patientenwechselTreffer.set(ergebnis);
      return;
    }

    this.suchergebnisNavigieren(ergebnis);
  }

  /** Bestätigt den Patientenkontextwechsel für ein Suchergebnis. */
  public patientenwechselBestaetigen(): void {
    const ergebnis = this.patientenwechselTreffer();

    if (!ergebnis?.patientId) {
      return;
    }

    const patient = this.patientContext.patienten().find((eintrag) => eintrag.id === ergebnis.patientId);

    if (!patient) {
      this.toastService.zeige('Patient nicht geladen', 'Der Treffer konnte keinem geladenen Patientenkontext zugeordnet werden.', 'danger');
      this.patientenwechselTreffer.set(null);
      return;
    }

    this.patientContext.patientSetzen(patient);
    this.patientenwechselTreffer.set(null);
    this.suchergebnisNavigieren(ergebnis, true);
  }

  /** Bricht den Patientenkontextwechsel ab. */
  public patientenwechselAbbrechen(): void {
    this.patientenwechselTreffer.set(null);
  }

  /** Liefert den Namen des aktuell aktiven Patienten. */
  public aktuellerPatientName(): string {
    return this.patientContext.aktiverPatient().name;
  }

  /** Liefert einen stabilen Track-Key für Suchergebnisse. */
  public suchergebnisTrackKey(ergebnis: GlobaleSuchergebnis): string {
    return `${ergebnis.badge}-${ergebnis.id}-${ergebnis.route}`;
  }

  /** Prüft, ob ein Treffer einen Wechsel des globalen Patientenkontexts braucht. */
  private ergebnisBrauchtPatientenwechsel(ergebnis: GlobaleSuchergebnis): boolean {
    return !!ergebnis.patientId && !!this.patientContext.aktiverPatient().id && ergebnis.patientId !== this.patientContext.aktiverPatient().id;
  }

  /** Navigiert zu einem Treffer und startet danach ein sichtbares Fokusfeedback. */
  private suchergebnisNavigieren(ergebnis: GlobaleSuchergebnis, patientWurdeGewechselt = false): void {
    this.suchbegriff.set('');
    this.suchergebnisAuswaehlen();
    const suchFokus = ergebnis.targetId || ergebnis.id;
    const queryParams: Record<string, string> = { suchFokus, suchLabel: ergebnis.title };

    if (ergebnis.patientId) {
      queryParams['patient'] = ergebnis.patientId;
    }

    this.router.navigate([ergebnis.route], { queryParams }).then(() => {
      this.suchFokusLabel.set(ergebnis.title);
      window.setTimeout(() => this.suchtrefferMarkieren(ergebnis), patientWurdeGewechselt ? 520 : 320);
      window.setTimeout(() => this.suchFokusLabel.set(''), 3000);
    });
  }

  /** Markiert das wahrscheinlich passende Zielelement temporär mit animiertem Rahmen. */
  private suchtrefferMarkieren(ergebnis: GlobaleSuchergebnis): void {
    const dokument = this.dokument;
    dokument.querySelectorAll('.gf-search-focus-target').forEach((element) => element.classList.remove('gf-search-focus-target'));
    const ziel = this.elementNachSuchergebnisFinden(ergebnis);

    if (!(ziel instanceof HTMLElement)) {
      return;
    }

    ziel.classList.add('gf-search-focus-target');
    ziel.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.setTimeout(() => ziel.classList.remove('gf-search-focus-target'), 2600);
  }

  /** Findet routeübergreifend das konkrete Zielelement eines Suchtreffers. */
  private elementNachSuchergebnisFinden(ergebnis: GlobaleSuchergebnis): HTMLElement | null {
    const hauptbereich = this.dokument.querySelector('.gf-app-main');

    if (!hauptbereich) {
      return null;
    }

    const idTreffer = this.elementNachSuchIdFinden(hauptbereich, ergebnis.targetId || ergebnis.id);

    if (idTreffer) {
      return idTreffer;
    }

    const suchwerte = [ergebnis.title, ergebnis.subtitle, ergebnis.patientName].filter((wert): wert is string => !!wert?.trim());

    for (const suchwert of suchwerte) {
      const textTreffer = this.elementNachGewichtetemTextFinden(hauptbereich, suchwert);

      if (textTreffer) {
        return textTreffer;
      }
    }

    return null;
  }

  /** Findet ein Element über explizite Suchziel-Attribute, falls eine Route diese bereitstellt. */
  private elementNachSuchIdFinden(hauptbereich: Element, id: string | undefined): HTMLElement | null {
    const bereinigteId = id?.trim();

    if (!bereinigteId) {
      return null;
    }

    const escapedId = this.cssWertEscapen(bereinigteId);
    const selektoren = [
      `[data-gf-search-id="${escapedId}"]`,
      `[data-gf-search-target="${escapedId}"]`,
      `#${escapedId}`
    ];

    for (const selektor of selektoren) {
      const element = hauptbereich.querySelector(selektor);

      if (element instanceof HTMLElement && this.elementIstSichtbar(element)) {
        return this.fokusfaehigesSuchElement(element);
      }
    }

    return null;
  }

  /** Findet per Textsuche bevorzugt Karten, Zeilen und Ergebnis-Elemente statt Routen-Container. */
  private elementNachGewichtetemTextFinden(hauptbereich: Element, text: string): HTMLElement | null {
    const suchtext = this.suchtextNormalisieren(text);

    if (!suchtext) {
      return null;
    }

    const selektor = [
      '.gf-patienten-route__card',
      '.gf-auswertung-route__value-row',
      '.gf-review-route__candidate',
      '.gf-import-route__job',
      '.gf-wissensbasis-route__entry',
      '.gf-berichte-route__value-card',
      '.gf-overview__urgent-item',
      '.gf-overview__activity article',
      'article',
      'button',
      'a'
    ].join(', ');

    const kandidaten = Array.from(hauptbereich.querySelectorAll(selektor))
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .filter((element) => this.elementIstSichtbar(element))
      .filter((element) => this.suchtextNormalisieren(element.textContent || '').includes(suchtext))
      .map((element) => this.fokusfaehigesSuchElement(element))
      .filter((element, index, liste) => liste.indexOf(element) === index)
      .sort((a, b) => this.suchfokusScore(a) - this.suchfokusScore(b));

    return kandidaten[0] ?? null;
  }

  /** Liefert ein sinnvolles Fokusziel, ohne auf äußere Seitencontainer hochzulaufen. */
  private fokusfaehigesSuchElement(element: HTMLElement): HTMLElement {
    const karte = element.closest('.gf-patienten-route__card, .gf-wissensbasis-route__entry, .gf-berichte-route__value-card, .gf-import-route__job, .gf-auswertung-route__value-row, .gf-review-route__candidate');
    return karte instanceof HTMLElement ? karte : element;
  }

  /** Gewichtet Treffer so, dass konkrete Karten und Zeilen vor großen Containern markiert werden. */
  private suchfokusScore(element: HTMLElement): number {
    const klasse = element.className.toString();
    const rect = element.getBoundingClientRect();
    const flaeche = Math.max(1, rect.width * rect.height);
    let prioritaet = 60;

    if (/gf-patienten-route__card|gf-auswertung-route__value-row|gf-review-route__candidate|gf-import-route__job|gf-wissensbasis-route__entry|gf-berichte-route__value-card/.test(klasse)) {
      prioritaet = 0;
    } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      prioritaet = 12;
    } else if (element.tagName === 'ARTICLE') {
      prioritaet = 24;
    }

    return prioritaet + flaeche / 100000;
  }

  /** Normalisiert Suchtexte für robuste Vergleiche. */
  private suchtextNormalisieren(wert: string): string {
    return wert.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /** Prüft, ob ein potenzielles Fokusziel sichtbar ist. */
  private elementIstSichtbar(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).visibility !== 'hidden';
  }

  /** Escaped CSS-Selektorwerte für IDs aus Suchtreffern. */
  private cssWertEscapen(wert: string): string {
    if ('CSS' in window && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(wert);
    }

    return wert.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  /** Ergänzt die globale Fokusanimation einmalig im Dokument. */
  private suchfokusStyleBereitstellen(): void {
    if (this.dokument.getElementById('gf-search-focus-style')) {
      return;
    }

    const style = this.dokument.createElement('style');
    style.id = 'gf-search-focus-style';
    style.textContent = `
      .gf-search-focus-target {
        position: relative !important;
        outline: 3px solid rgba(0, 94, 184, 0.56) !important;
        outline-offset: 6px !important;
        animation: gf-search-focus-pulse 1200ms ease-in-out 0s 2 both !important;
      }

      @keyframes gf-search-focus-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0, 94, 184, 0.0), var(--gf-shadow-raised); }
        45% { box-shadow: 0 0 0 8px rgba(0, 94, 184, 0.14), var(--gf-shadow-raised); }
      }
    `;
    this.dokument.head.appendChild(style);
  }

  /** Plant die backendseitige Suche mit kurzem Debounce. */
  private globaleSuchePlanen(wert: string): void {
    const query = wert.trim();

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

  /** Führt die globale Suche über die Backend-API aus. */
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
