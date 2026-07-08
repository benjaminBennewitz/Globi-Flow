/* src/app/pages/uebersicht-page/uebersicht-page.component.ts */

/**
 * @file Rendert die allgemeine Arztübersicht ohne Patientenvorauswahl.
 * @module UebersichtPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AktivitaetsEintrag, AktivitaetsFilter, DringenderHinweis, GesundheitsverlaufPunkt, UebersichtAktionStatus, UebersichtDetailEintrag, UebersichtViewModel } from '../../core/models/uebersicht.model';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { Patient, PatientBefund } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';

/** Übersichtsroute mit allgemeinen Praxis-, Import- und Review-Kennzahlen. */
@Component({
  selector: 'gf-uebersicht-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './uebersicht-page.component.html',
  styleUrl: './uebersicht-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UebersichtPageComponent {
  /** API-bereiter Datenservice. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Router für kontextbewusste Hinweisnavigation. */
  private readonly router = inject(Router);

  /** Zentraler Patientenkontext für Hinweis- und KPI-Navigation. */
  protected readonly patientContext = inject(PatientContextService);

  /** Drag-Zustand für die horizontale Chart-Navigation. */
  private dragAktiv = false;

  /** Startposition der Chart-Dragbewegung. */
  private dragStartX = 0;

  /** Scrollposition beim Start der Chart-Dragbewegung. */
  private dragStartScroll = 0;

  /** Aggregierte Übersichtsdaten aus Mock oder später API. */
  protected readonly uebersicht$ = this.globiFlowApi.ladeUebersicht();


  /** Geführter Kernworkflow vom Befund bis zum Patientenbericht. */
  public readonly workflowSchritte = [
    {
      nummer: '01',
      titel: 'Patient wählen',
      text: 'Arbeitskontext setzen oder neue Testperson anlegen.',
      route: '/patienten',
      icon: 'assignment_ind',
      status: 'bereit'
    },
    {
      nummer: '02',
      titel: 'Befund importieren',
      text: 'PDF analysieren, Rohtext extrahieren und Werte erkennen.',
      route: '/importe',
      icon: 'upload_file',
      status: 'aktiv'
    },
    {
      nummer: '03',
      titel: 'Daten prüfen',
      text: 'Nur unsichere oder auffällige Extraktionen manuell korrigieren.',
      route: '/review',
      icon: 'fact_check',
      status: 'offen'
    },
    {
      nummer: '04',
      titel: 'Tendenzen auswerten',
      text: 'Normalisierte Werte, Referenzbereiche und Verlauf überlagern.',
      route: '/auswertung',
      icon: 'monitoring',
      status: 'bereit'
    },
    {
      nummer: '05',
      titel: 'Bericht freigeben',
      text: 'Patientenverständliche Zusammenfassung aus geprüften Daten erzeugen.',
      route: '/berichte',
      icon: 'article',
      status: 'gesperrt'
    }
  ];

  /** Gibt an, ob der Aktualisierungs-Overlay angezeigt wird. */
  public readonly aktualisierungAktiv: WritableSignal<boolean> = signal(false);

  /** Aktuell ausgewähltes Jahr. */
  public ausgewaehltesJahr = 2026;

  /** Erster angezeigter Monat. */
  public monatVon = 1;

  /** Letzter angezeigter Monat. */
  public monatBis = 12;

  /** Aktuell geöffnetes Monatsmenü. */
  public aktivesMonatsmenue: 'von' | 'bis' | null = null;

  /** Verfügbare Jahre im Mockdiagramm. */
  public readonly jahre = [2024, 2025, 2026];

  /** Verfügbare Monate für Range-Filter. */
  public readonly monate = [
    { wert: 1, label: 'Jan' },
    { wert: 2, label: 'Feb' },
    { wert: 3, label: 'Mär' },
    { wert: 4, label: 'Apr' },
    { wert: 5, label: 'Mai' },
    { wert: 6, label: 'Jun' },
    { wert: 7, label: 'Jul' },
    { wert: 8, label: 'Aug' },
    { wert: 9, label: 'Sep' },
    { wert: 10, label: 'Okt' },
    { wert: 11, label: 'Nov' },
    { wert: 12, label: 'Dez' }
  ];

  /** Aktuell geöffnetes Cursor-Overlay. */
  public overlayTyp: 'hinweise' | 'aktivitaeten' | 'importe' | 'review' | null = null;

  /** X-Position des Cursor-Overlays. */
  public overlayX = 0;

  /** Y-Position des Cursor-Overlays. */
  public overlayY = 0;

  /** Aktiver Hinweis im Hinweis-Overlay. */
  public aktiverHinweisId: string | null = null;

  /** Aktiver Filter des Aktivitäts-Overlays. */
  public aktivitaetsFilter: AktivitaetsFilter = 'heute';

  /** Ziel, das vor Navigation einen Patientenkontextwechsel benötigt. */
  public readonly patientenwechselZiel: WritableSignal<DringenderHinweis | UebersichtDetailEintrag | null> = signal(null);

  /** Startet den temporären Aktualisierungs-Overlay. */
  public datenAktualisieren(): void {
    this.aktualisierungAktiv.set(true);
    window.setTimeout(() => {
      this.aktualisierungAktiv.set(false);
    }, 3000);
  }

  /** Ändert das aktive Jahr. */
  public jahrAendern(jahr: number): void {
    this.ausgewaehltesJahr = jahr;
  }

  /** Öffnet oder schließt ein Custom-Monatsmenü. */
  public monatsmenueUmschalten(menue: 'von' | 'bis'): void {
    this.aktivesMonatsmenue = this.aktivesMonatsmenue === menue ? null : menue;
  }

  /** Setzt den Startmonat der Diagramm-Range. */
  public monatVonSetzen(monat: number): void {
    this.monatVon = Math.min(monat, this.monatBis);
    this.aktivesMonatsmenue = null;
  }

  /** Setzt den Endmonat der Diagramm-Range. */
  public monatBisSetzen(monat: number): void {
    this.monatBis = Math.max(monat, this.monatVon);
    this.aktivesMonatsmenue = null;
  }

  /** Gibt das Kurzlabel eines Monats zurück. */
  public monatsLabel(monat: number): string {
    return this.monate.find((eintrag: { wert: number; label: string }) => eintrag.wert === monat)?.label ?? '';
  }

  /** Filtert den Gesundheitsverlauf nach Jahr und Monatsbereich. */
  public sichtbarerVerlauf(verlauf: GesundheitsverlaufPunkt[]): GesundheitsverlaufPunkt[] {
    return verlauf.filter((punkt: GesundheitsverlaufPunkt) => punkt.jahr === this.ausgewaehltesJahr && punkt.monat >= this.monatVon && punkt.monat <= this.monatBis);
  }

  /** Berechnet SVG-Punkte mit gemeinsamer Skala für beide Linien. */
  public verlaufPunkte(verlauf: GesundheitsverlaufPunkt[], key: 'unauffaellig' | 'auffaellig'): string {
    const sichtbarePunkte = this.sichtbarerVerlauf(verlauf);
    return sichtbarePunkte.map((punkt: GesundheitsverlaufPunkt, index: number) => {
      const x = this.punktX(sichtbarePunkte, index);
      const y = this.punktY(sichtbarePunkte, punkt[key]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  /** Berechnet die X-Position eines Datenpunkts. */
  public punktX(verlauf: GesundheitsverlaufPunkt[], index: number): number {
    const maxIndex = Math.max(verlauf.length - 1, 1);
    return 54 + (index / maxIndex) * 1052;
  }

  /** Berechnet die Y-Position eines Datenpunkts mit gemeinsamer Skala. */
  public punktY(verlauf: GesundheitsverlaufPunkt[], wert: number): number {
    const alleWerte = [...verlauf.map((punkt: GesundheitsverlaufPunkt) => punkt.unauffaellig), ...verlauf.map((punkt: GesundheitsverlaufPunkt) => punkt.auffaellig)];
    const min = Math.min(...alleWerte);
    const max = Math.max(...alleWerte);
    const span = Math.max(max - min, 1);
    return 238 - ((wert - min) / span) * 168;
  }

  /** Startet das horizontale Drag-Scrolling im Chart. */
  public chartDragStart(event: PointerEvent, element: HTMLElement): void {
    this.dragAktiv = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = element.scrollLeft;
    element.setPointerCapture(event.pointerId);
  }

  /** Bewegt den Chart per Drag. */
  public chartDragMove(event: PointerEvent, element: HTMLElement): void {
    if (!this.dragAktiv) {
      return;
    }

    event.preventDefault();
    element.scrollLeft = this.dragStartScroll - (event.clientX - this.dragStartX);
  }

  /** Beendet das horizontale Drag-Scrolling. */
  public chartDragEnd(event: PointerEvent, element: HTMLElement): void {
    this.dragAktiv = false;

    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  }

  /** Öffnet das Hinweis-Overlay an der Cursorposition. */
  public hinweisOverlayOeffnen(event: MouseEvent, hinweisId: string): void {
    this.overlayPositionSetzen(event, false);
    this.aktiverHinweisId = hinweisId;
    this.overlayTyp = 'hinweise';
  }

  /** Öffnet das Aktivitäts-Overlay an der Cursorposition. */
  public aktivitaetenOverlayOeffnen(event: MouseEvent): void {
    this.overlayPositionSetzen(event, true);
    this.aktiverHinweisId = null;
    this.overlayTyp = 'aktivitaeten';
  }

  /** Öffnet ein Kennzahlen-Overlay an der Cursorposition. */
  public kpiOverlayOeffnen(event: MouseEvent, typ: 'importe' | 'review'): void {
    event.stopPropagation();
    this.overlayPositionSetzen(event, true);
    this.aktiverHinweisId = null;
    this.overlayTyp = typ;
  }

  /** Liefert die Detailzeilen für ein Kennzahlen-Overlay. */
  public kpiDetails(uebersicht: UebersichtViewModel, typ: 'importe' | 'review'): UebersichtDetailEintrag[] {
    return typ === 'importe' ? uebersicht.ungepruefteImporte ?? [] : uebersicht.reviewOffenListe ?? [];
  }

  /** Schließt das aktive Cursor-Overlay. */
  public overlaySchliessen(): void {
    this.overlayTyp = null;
    this.aktiverHinweisId = null;
  }

  /** Öffnet einen dringenden Hinweis mit Patientenkontextprüfung. */
  public hinweisEintragOeffnen(hinweis: DringenderHinweis): void {
    this.zielOeffnen(hinweis, hinweis.route || '/review');
  }

  /** Öffnet einen KPI-Detailtreffer mit Patientenkontextprüfung. */
  public detailEintragOeffnen(eintrag: UebersichtDetailEintrag, fallbackRoute: string): void {
    this.zielOeffnen(eintrag, eintrag.route || fallbackRoute);
  }

  /** Bestätigt den Patientenkontextwechsel für einen Hinweis oder KPI-Treffer. */
  public patientenwechselBestaetigen(): void {
    const ziel = this.patientenwechselZiel();

    if (!ziel) {
      return;
    }

    this.patientenwechselZiel.set(null);
    this.zielNavigieren(ziel, ziel.route || '/review', true);
  }

  /** Bricht den Patientenkontextwechsel ab. */
  public patientenwechselAbbrechen(): void {
    this.patientenwechselZiel.set(null);
  }

  /** Liefert den Namen des aktuell aktiven Patienten. */
  public aktuellerPatientName(): string {
    return this.patientContext.aktiverPatient().name;
  }

  /** Liefert den Namen des Zielpatienten für den Wechselhinweis. */
  public zielPatientName(ziel: DringenderHinweis | UebersichtDetailEintrag): string {
    return ziel.patientName || this.patientContext.patienten().find((patient: Patient) => patient.id === ziel.patientId)?.name || 'Zielpatient';
  }

  /** Setzt den aktiven Aktivitätsfilter. */
  public aktivitaetsFilterSetzen(filter: AktivitaetsFilter): void {
    this.aktivitaetsFilter = filter;
  }

  /** Filtert Aktivitäten für das Overlay. */
  public gefilterteAktivitaeten(aktivitaeten: AktivitaetsEintrag[]): AktivitaetsEintrag[] {
    if (this.aktivitaetsFilter === 'heute') {
      return aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset === 0);
    }

    if (this.aktivitaetsFilter === 'gestern') {
      return aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset === 1);
    }

    if (this.aktivitaetsFilter === 'drei_tage') {
      return aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset <= 3);
    }

    return aktivitaeten.filter((eintrag: AktivitaetsEintrag) => eintrag.tagOffset <= 7);
  }

  /** Gibt die passende Statusklasse zurück. */
  public statusKlasse(status: UebersichtAktionStatus): string {
    return `is-${status}`;
  }

  /** Gibt das passende Icon für dringende Hinweise zurück. */
  public hinweisIcon(hinweis: DringenderHinweis): string {
    if (hinweis.status === 'kritisch') {
      return 'priority_high';
    }

    if (hinweis.status === 'warnung') {
      return 'warning';
    }

    return 'info';
  }

  /** Öffnet ein Ziel oder fordert vorher einen Patientenkontextwechsel an. */
  private zielOeffnen(ziel: DringenderHinweis | UebersichtDetailEintrag, fallbackRoute: string): void {
    if (this.zielBrauchtPatientenwechsel(ziel)) {
      this.patientenwechselZiel.set({ ...ziel, route: ziel.route || fallbackRoute });
      return;
    }

    this.zielNavigieren(ziel, fallbackRoute);
  }

  /** Prüft, ob der Zielpatient vom aktiven Patientenkontext abweicht. */
  private zielBrauchtPatientenwechsel(ziel: DringenderHinweis | UebersichtDetailEintrag): boolean {
    return !!ziel.patientId && !!this.patientContext.aktiverPatient().id && ziel.patientId !== this.patientContext.aktiverPatient().id;
  }

  /** Navigiert zu Hinweis- oder KPI-Ziel und setzt vorher den passenden Kontext. */
  private zielNavigieren(ziel: DringenderHinweis | UebersichtDetailEintrag, fallbackRoute: string, patientWurdeGewechselt = false): void {
    this.zielKontextSetzen(ziel);
    this.overlaySchliessen();
    const route = ziel.route || fallbackRoute;
    const queryParams: Record<string, string> = {};

    if (ziel.patientId) {
      queryParams['patient'] = ziel.patientId;
    }

    if (ziel.befundId) {
      queryParams['befund'] = ziel.befundId;
      queryParams['reportId'] = ziel.befundId;
    }

    const suchFokus = 'targetId' in ziel && ziel.targetId ? ziel.targetId : ziel.id;

    if (suchFokus) {
      queryParams['suchFokus'] = suchFokus;
      queryParams['suchLabel'] = ziel.titel;
    }

    this.router.navigate([route], { queryParams }).then(() => {
      window.setTimeout(() => this.zielMarkieren(suchFokus), patientWurdeGewechselt ? 520 : 280);
    });
  }

  /** Setzt Patient und Befund, sofern sie im geladenen Kontext vorhanden sind. */
  private zielKontextSetzen(ziel: DringenderHinweis | UebersichtDetailEintrag): void {
    if (!ziel.patientId) {
      return;
    }

    const patient = this.patientContext.patienten().find((eintrag: Patient) => eintrag.id === ziel.patientId);

    if (!patient) {
      return;
    }

    this.patientContext.patientSetzen(patient);

    if (!ziel.befundId) {
      return;
    }

    const befund = patient.befundListe.find((eintrag: PatientBefund) => eintrag.id === ziel.befundId);

    if (befund) {
      this.patientContext.befundSetzen(befund);
    }
  }

  /** Markiert ein Ziel innerhalb der Übersicht kurz sichtbar. */
  private zielMarkieren(targetId: string): void {
    const ziel = document.querySelector(`[data-gf-search-id="${this.cssWertEscapen(targetId)}"], [data-gf-search-target="${this.cssWertEscapen(targetId)}"]`);

    if (!(ziel instanceof HTMLElement)) {
      return;
    }

    ziel.classList.add('gf-overview__local-focus');
    ziel.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.setTimeout(() => ziel.classList.remove('gf-overview__local-focus'), 2400);
  }

  /** Escaped CSS-Selektorwerte für lokale Fokusziele. */
  private cssWertEscapen(wert: string): string {
    if ('CSS' in window && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(wert);
    }

    return wert.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  /** Setzt die Overlay-Position begrenzt auf den sichtbaren Viewport. */
  private overlayPositionSetzen(event: MouseEvent, istBreit: boolean): void {
    const rand = 16;
    const breite = Math.min(istBreit ? 560 : 470, window.innerWidth - rand * 2);
    const hoehe = Math.min(520, window.innerHeight - rand * 2);
    const zielX = event.clientX + 16;
    const zielY = event.clientY + 16;
    this.overlayX = Math.max(rand, Math.min(zielX, window.innerWidth - breite - rand));
    this.overlayY = Math.max(rand, Math.min(zielY, window.innerHeight - hoehe - rand));
  }
}

