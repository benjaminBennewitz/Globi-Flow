/* src/app/pages/uebersicht-page/uebersicht-page.component.ts */

/**
 * @file Rendert die allgemeine Arztübersicht ohne Patientenvorauswahl.
 * @module UebersichtPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AktivitaetsEintrag, AktivitaetsFilter, DringenderHinweis, GesundheitsverlaufPunkt, UebersichtAktionStatus } from '../../core/models/uebersicht.model';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';

/** Übersichtsroute mit allgemeinen Praxis-, Import- und Review-Kennzahlen. */
@Component({
  selector: 'dd-uebersicht-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './uebersicht-page.component.html',
  styleUrl: './uebersicht-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UebersichtPageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Drag-Zustand für die horizontale Chart-Navigation. */
  private dragAktiv = false;

  /** Startposition der Chart-Dragbewegung. */
  private dragStartX = 0;

  /** Scrollposition beim Start der Chart-Dragbewegung. */
  private dragStartScroll = 0;

  /** Aggregierte Übersichtsdaten aus Mock oder später API. */
  protected readonly uebersicht$ = this.datenDashboardApi.ladeUebersicht();

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
  public overlayTyp: 'hinweise' | 'aktivitaeten' | null = null;

  /** X-Position des Cursor-Overlays. */
  public overlayX = 0;

  /** Y-Position des Cursor-Overlays. */
  public overlayY = 0;

  /** Aktiver Hinweis im Hinweis-Overlay. */
  public aktiverHinweisId: string | null = null;

  /** Aktiver Filter des Aktivitäts-Overlays. */
  public aktivitaetsFilter: AktivitaetsFilter = 'heute';

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
    this.overlayPositionSetzen(event);
    this.aktiverHinweisId = hinweisId;
    this.overlayTyp = 'hinweise';
  }

  /** Öffnet das Aktivitäts-Overlay an der Cursorposition. */
  public aktivitaetenOverlayOeffnen(event: MouseEvent): void {
    this.overlayPositionSetzen(event);
    this.aktiverHinweisId = null;
    this.overlayTyp = 'aktivitaeten';
  }

  /** Schließt das aktive Cursor-Overlay. */
  public overlaySchliessen(): void {
    this.overlayTyp = null;
    this.aktiverHinweisId = null;
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

  /** Setzt die Overlay-Position begrenzt auf den sichtbaren Viewport. */
  private overlayPositionSetzen(event: MouseEvent): void {
    this.overlayX = Math.min(event.clientX + 16, window.innerWidth - 500);
    this.overlayY = Math.min(event.clientY + 16, window.innerHeight - 520);
    this.overlayX = Math.max(this.overlayX, 16);
    this.overlayY = Math.max(this.overlayY, 16);
  }
}
