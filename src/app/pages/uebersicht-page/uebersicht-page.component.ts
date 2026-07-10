/* src/app/pages/uebersicht-page/uebersicht-page.component.ts */

/**
 * @file Rendert die allgemeine Arztübersicht ohne Patientenvorauswahl.
 * @module UebersichtPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Patient, PatientBefund } from '../../core/models/patient.model';
import { AktivitaetsEintrag, AktivitaetsFilter, DringenderHinweis, GesundheitsverlaufPunkt, UebersichtDetailEintrag } from '../../core/models/uebersicht.model';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import {
  aktivitaetenFiltern, hinweisIconErmitteln, kpiDetailsErmitteln, monatsLabelErmitteln, overlayPositionErmitteln,
  punktXErmitteln, punktYErmitteln, sichtbarenVerlaufErmitteln, statusKlasseErmitteln, UEBERSICHT_JAHRE,
  UEBERSICHT_MONATE, UEBERSICHT_WORKFLOW_SCHRITTE, verlaufPunkteErmitteln, zielBrauchtPatientenwechsel, zielMarkieren, zielNavigationErmitteln
} from './uebersicht-page-logik';

/** Übersichtsroute mit allgemeinen Praxis-, Import- und Reviewkennzahlen. */
@Component({
  selector: 'gf-uebersicht-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './uebersicht-page.component.html',
  styleUrl: './uebersicht-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UebersichtPageComponent {
  private readonly globiFlowApi = inject(GlobiFlowApiService);        // API-Service für aggregierte Übersichtsdaten.
  private readonly router = inject(Router);                           // Router für kontextbezogene Zielnavigation.
  protected readonly patientContext = inject(PatientContextService);  // Zentraler Patienten- und Befundkontext.

  private dragAktiv = false;    // Aktiver Zustand des Chart-Draggings.
  private dragStartX = 0;       // Horizontale Startposition der Dragbewegung.
  private dragStartScroll = 0;  // Scrollposition beim Start der Dragbewegung.

  protected readonly uebersicht$ = this.globiFlowApi.ladeUebersicht();  // Aggregierte Daten der lokalen API.

  public readonly workflowSchritte = UEBERSICHT_WORKFLOW_SCHRITTE;  // Geführter Kernworkflow der Anwendung.
  public readonly jahre = UEBERSICHT_JAHRE;                         // Verfügbare Diagrammjahre.
  public readonly monate = UEBERSICHT_MONATE;                       // Monate für die Diagramm-Range.
  public readonly monatsLabel = monatsLabelErmitteln;               // Liefert ein Monatskurzlabel.
  public readonly punktX = punktXErmitteln;                         // Berechnet horizontale SVG-Koordinaten.
  public readonly punktY = punktYErmitteln;                         // Berechnet vertikale SVG-Koordinaten.
  public readonly kpiDetails = kpiDetailsErmitteln;                 // Liefert KPI-Detailzeilen.
  public readonly statusKlasse = statusKlasseErmitteln;             // Erzeugt die visuelle Statusklasse.
  public readonly hinweisIcon = hinweisIconErmitteln;               // Liefert das Symbol eines Hinweises.

  public readonly aktualisierungAktiv: WritableSignal<boolean> = signal(false);  // Sichtbarkeit des Aktualisierungs-Overlays.

  /** Ziel eines bestätigungspflichtigen Patientenkontextwechsels. */
  public readonly patientenwechselZiel: WritableSignal<DringenderHinweis | UebersichtDetailEintrag | null> = signal(null);

  public ausgewaehltesJahr = 2026;                                                    // Aktuell ausgewähltes Diagrammjahr.
  public monatVon = 1;                                                                // Erster sichtbarer Monat.
  public monatBis = 12;                                                               // Letzter sichtbarer Monat.
  public aktivesMonatsmenue: 'von' | 'bis' | null = null;                             // Aktuell geöffnetes Monatsmenü.
  public overlayTyp: 'hinweise' | 'aktivitaeten' | 'importe' | 'review' | null = null;  // Aktuell geöffnetes Cursor-Overlay.
  public overlayX = 0;                                                                // Horizontale Overlayposition.
  public overlayY = 0;                                                                // Vertikale Overlayposition.
  public aktiverHinweisId: string | null = null;                                      // Aktiver Hinweis im Overlay.
  public aktivitaetsFilter: AktivitaetsFilter = 'heute';                              // Zeitraumfilter für Aktivitäten.

  /** Startet den temporären Aktualisierungszustand der Übersicht. */
  public datenAktualisieren(): void {
    this.aktualisierungAktiv.set(true);
    window.setTimeout(() => this.aktualisierungAktiv.set(false), 3000);
  }

  /** @param jahr Ausgewähltes Kalenderjahr. */
  public jahrAendern(jahr: number): void {
    this.ausgewaehltesJahr = jahr;
  }

  /** @param menue Gewünschtes Start- oder Endmonatsmenü. */
  public monatsmenueUmschalten(menue: 'von' | 'bis'): void {
    this.aktivesMonatsmenue = this.aktivesMonatsmenue === menue ? null : menue;
  }

  /** @param monat Gewählter Startmonat. */
  public monatVonSetzen(monat: number): void {
    this.monatVon = Math.min(monat, this.monatBis);
    this.aktivesMonatsmenue = null;
  }

  /** @param monat Gewählter Endmonat. */
  public monatBisSetzen(monat: number): void {
    this.monatBis = Math.max(monat, this.monatVon);
    this.aktivesMonatsmenue = null;
  }

  /**
   * Filtert den Gesundheitsverlauf anhand der aktuellen Range.
   * @param verlauf Vollständiger Gesundheitsverlauf.
   * @returns Sichtbare Verlaufspunkte.
   */
  public sichtbarerVerlauf(verlauf: GesundheitsverlaufPunkt[]): GesundheitsverlaufPunkt[] {
    return sichtbarenVerlaufErmitteln(verlauf, this.ausgewaehltesJahr, this.monatVon, this.monatBis);
  }

  /**
   * Berechnet die SVG-Punktliste einer Verlaufslinie.
   * @param verlauf Vollständiger Gesundheitsverlauf.
   * @param key Auszuwertende Verlaufslinie.
   * @returns SVG-kompatible Punktliste.
   */
  public verlaufPunkte(verlauf: GesundheitsverlaufPunkt[], key: 'unauffaellig' | 'auffaellig'): string {
    return verlaufPunkteErmitteln(this.sichtbarerVerlauf(verlauf), key);
  }

  /**
   * Startet das horizontale Chart-Dragging.
   * @param event Auslösendes Pointerereignis.
   * @param element Scrollbarer Chartcontainer.
   */
  public chartDragStart(event: PointerEvent, element: HTMLElement): void {
    this.dragAktiv = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = element.scrollLeft;
    element.setPointerCapture(event.pointerId);
  }

  /**
   * Verschiebt den Chart während des Draggings.
   * @param event Aktuelles Pointerereignis.
   * @param element Scrollbarer Chartcontainer.
   */
  public chartDragMove(event: PointerEvent, element: HTMLElement): void {
    if (!this.dragAktiv) {
      return;
    }

    event.preventDefault();
    element.scrollLeft = this.dragStartScroll - (event.clientX - this.dragStartX);
  }

  /**
   * Beendet das horizontale Chart-Dragging.
   * @param event Abschließendes Pointerereignis.
   * @param element Scrollbarer Chartcontainer.
   */
  public chartDragEnd(event: PointerEvent, element: HTMLElement): void {
    this.dragAktiv = false;

    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  }

  /**
   * Öffnet das Hinweis-Overlay.
   * @param event Auslösendes Mausereignis.
   * @param hinweisId ID des aktiven Hinweises.
   */
  public hinweisOverlayOeffnen(event: MouseEvent, hinweisId: string): void {
    this.overlayPositionSetzen(event, false);
    this.aktiverHinweisId = hinweisId;
    this.overlayTyp = 'hinweise';
  }

  /** @param event Auslösendes Mausereignis. */
  public aktivitaetenOverlayOeffnen(event: MouseEvent): void {
    this.overlayPositionSetzen(event, true);
    this.aktiverHinweisId = null;
    this.overlayTyp = 'aktivitaeten';
  }

  /**
   * Öffnet ein Kennzahlen-Overlay.
   * @param event Auslösendes Mausereignis.
   * @param typ Gewünschter KPI-Typ.
   */
  public kpiOverlayOeffnen(event: MouseEvent, typ: 'importe' | 'review'): void {
    event.stopPropagation();
    this.overlayPositionSetzen(event, true);
    this.aktiverHinweisId = null;
    this.overlayTyp = typ;
  }

  /** Schließt das aktive Cursor-Overlay. */
  public overlaySchliessen(): void {
    this.overlayTyp = null;
    this.aktiverHinweisId = null;
  }

  /** @param hinweis Ausgewählter dringender Hinweis. */
  public hinweisEintragOeffnen(hinweis: DringenderHinweis): void {
    this.zielOeffnen(hinweis, hinweis.route || '/review');
  }

  /**
   * Öffnet einen KPI-Detailtreffer.
   * @param eintrag Ausgewählter Detailtreffer.
   * @param fallbackRoute Ersatzroute ohne eigenes Ziel.
   */
  public detailEintragOeffnen(eintrag: UebersichtDetailEintrag, fallbackRoute: string): void {
    this.zielOeffnen(eintrag, eintrag.route || fallbackRoute);
  }

  /** Bestätigt den angeforderten Patientenkontextwechsel. */
  public patientenwechselBestaetigen(): void {
    const ziel: DringenderHinweis | UebersichtDetailEintrag | null = this.patientenwechselZiel();  // Vorgemerktes Ziel.

    if (!ziel) {
      return;
    }

    this.patientenwechselZiel.set(null);
    this.zielNavigieren(ziel, ziel.route || '/review', true);
  }

  /** Bricht den angeforderten Patientenkontextwechsel ab. */
  public patientenwechselAbbrechen(): void {
    this.patientenwechselZiel.set(null);
  }

  /** @returns Name des aktuell aktiven Patienten. */
  public aktuellerPatientName(): string {
    return this.patientContext.aktiverPatient().name;
  }

  /**
   * Liefert den Namen des Zielpatienten.
   * @param ziel Ausgewähltes Hinweis- oder KPI-Ziel.
   * @returns Hinterlegter oder lokal ermittelter Patientenname.
   */
  public zielPatientName(ziel: DringenderHinweis | UebersichtDetailEintrag): string {
    return ziel.patientName || this.patientContext.patienten().find((patient: Patient) => patient.id === ziel.patientId)?.name || 'Zielpatient';
  }

  /** @param filter Gewählter Zeitraumfilter. */
  public aktivitaetsFilterSetzen(filter: AktivitaetsFilter): void {
    this.aktivitaetsFilter = filter;
  }

  /**
   * Filtert das Aktivitätsprotokoll.
   * @param aktivitaeten Vollständiges Aktivitätsprotokoll.
   * @returns Aktivitäten innerhalb des gewählten Zeitraums.
   */
  public gefilterteAktivitaeten(aktivitaeten: AktivitaetsEintrag[]): AktivitaetsEintrag[] {
    return aktivitaetenFiltern(aktivitaeten, this.aktivitaetsFilter);
  }

  /**
   * Öffnet ein Ziel oder fordert einen Kontextwechsel an.
   * @param ziel Hinweis- oder KPI-Ziel.
   * @param fallbackRoute Ersatzroute ohne eigenes Ziel.
   */
  private zielOeffnen(ziel: DringenderHinweis | UebersichtDetailEintrag, fallbackRoute: string): void {
    if (zielBrauchtPatientenwechsel(ziel, this.patientContext.aktiverPatient().id)) {
      this.patientenwechselZiel.set({ ...ziel, route: ziel.route || fallbackRoute });
      return;
    }

    this.zielNavigieren(ziel, fallbackRoute);
  }

  /**
   * Navigiert zum Ziel und setzt den passenden Kontext.
   * @param ziel Hinweis- oder KPI-Ziel.
   * @param fallbackRoute Ersatzroute ohne eigenes Ziel.
   * @param patientWurdeGewechselt Verlängert die Markierungsverzögerung.
   */
  private zielNavigieren(ziel: DringenderHinweis | UebersichtDetailEintrag, fallbackRoute: string, patientWurdeGewechselt = false): void {
    this.zielKontextSetzen(ziel);
    this.overlaySchliessen();

    const route: string = ziel.route || fallbackRoute;                                // Effektive Zielroute.
    const navigation = zielNavigationErmitteln(ziel);                                 // Queryparameter und Fokusziel.

    this.router.navigate([route], { queryParams: navigation.queryParams }).then(() => {
      window.setTimeout(() => zielMarkieren(navigation.suchFokus), patientWurdeGewechselt ? 520 : 280);
    });
  }

  /**
   * Setzt Patient und Befund des ausgewählten Ziels.
   * @param ziel Ziel mit optionalem Patientenkontext.
   */
  private zielKontextSetzen(ziel: DringenderHinweis | UebersichtDetailEintrag): void {
    if (!ziel.patientId) {
      return;
    }

    const patient: Patient | undefined = this.patientContext.patienten().find((eintrag: Patient) => eintrag.id === ziel.patientId);  // Passender Patient.

    if (!patient) {
      return;
    }

    this.patientContext.patientSetzen(patient);

    if (ziel.befundId) {
      const befund: PatientBefund | undefined = patient.befundListe.find((eintrag: PatientBefund) => eintrag.id === ziel.befundId);  // Passender Befund.

      if (befund) {
        this.patientContext.befundSetzen(befund);
      }
    }
  }

  /**
   * Setzt die viewportbegrenzte Overlayposition.
   * @param event Mausereignis mit Cursorposition.
   * @param istBreit Breites Overlayformat.
   */
  private overlayPositionSetzen(event: MouseEvent, istBreit: boolean): void {
    const position = overlayPositionErmitteln(event, istBreit, window.innerWidth, window.innerHeight);  // Berechnete Position.
    this.overlayX = position.x;
    this.overlayY = position.y;
  }
}
