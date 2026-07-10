/* src/app/pages/analyse-page/analyse-page.component.ts */

/**
 * @file Routenseite für fachliche Laborwertauswertung.
 * @module AnalysePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { AuswertungLaborwert, AuswertungReviewStatus, AuswertungViewModel } from '../../core/models/auswertung.model';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import * as diagramm from './analyse-page-diagramm';
import * as logik from './analyse-page-logik';

/** Route `/auswertung` mit analytischer Laborwertansicht. */
@Component({
  selector: 'gf-analyse-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './analyse-page.component.html',
  styleUrl: './analyse-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysePageComponent {
  private readonly globiFlowApi = inject(GlobiFlowApiService);     // API-bereiter Datenservice.
  public readonly patientContext = inject(PatientContextService);  // Globaler Patientenkontext.

  /** Lädt die Auswertung erneut, sobald Patient oder Befund gewechselt werden. */
  protected readonly auswertung$ = combineLatest([toObservable(this.patientContext.aktiverBefundId), toObservable(this.patientContext.aktiverPatientId)]).pipe(
    switchMap(([befundId, patientId]) => this.globiFlowApi.ladeAuswertung(befundId, patientId))
  );

  public readonly diagrammAnimationsToken: WritableSignal<number> = signal(0);                     // Animations-Token für erneutes Zeichnen des Verlaufs.
  public readonly aktiveGruppe: WritableSignal<string> = signal('alle');                           // Aktive Gruppe für Tabellen und Detailansicht.
  public readonly aktiverStatus: WritableSignal<logik.AuswertungStatusFilter> = signal('alle');    // Aktiver Statusfilter.
  public readonly overlayStatus: WritableSignal<logik.AuswertungStatusFilter> = signal('alle');    // Statusfilter der Verlaufsauswahl.
  public readonly overlayFokusWertId: WritableSignal<string | null> = signal(null);                // Fokussierter Wert im überlagerten Verlauf.
  public readonly aktiverWertId: WritableSignal<string> = signal('auswertung-ldl');                // Aktuell selektierter Laborwert.
  public readonly nurGepruefteWerte: WritableSignal<boolean> = signal(false);                      // Blendet ungeprüfte Werte aus.
  public readonly aktiveOverlayWertIds: WritableSignal<string[]> = signal([]);                     // Manuell aktivierte Verlaufslinien.
  public readonly overlayAuswahlManuell: WritableSignal<boolean> = signal(false);                  // Kennzeichnet eine manuelle Verlaufsauswahl.

  /** Verfügbare Statusfilter für Tabellen- und Verlaufsauswahl. */
  public readonly statusFilter: { key: logik.AuswertungStatusFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'hoch', label: 'Erhöht' },
    { key: 'niedrig', label: 'Niedrig' },
    { key: 'review', label: 'Review' },
    { key: 'normal', label: 'Normal' }
  ];

  /** Reine fachliche Auswertungs- und Formatierungsfunktionen. */
  public readonly hatVergleich = logik.hatVergleich;                        // Prüft, ob ein Vergleichsbefund vorhanden ist.
  public readonly hatWertVergleich = logik.hatWertVergleich;                // Prüft den Vergleich eines einzelnen Laborwerts.
  public readonly vergleichsBefundLabel = logik.vergleichsBefundLabel;      // Liefert das Label des Vergleichsbefunds.
  public readonly trendDeltaText = logik.trendDeltaText;                    // Formatiert die prozentuale Trendänderung.
  public readonly vorherigerWertText = logik.vorherigerWertText;            // Formatiert den vorherigen Messwert.
  public readonly aenderungKurzText = logik.aenderungKurzText;              // Formatiert die kompakte Veränderung.
  public readonly vergleichBeschreibung = logik.vergleichBeschreibung;      // Beschreibt den Vergleichskontext.
  public readonly kennzahlen = logik.kennzahlen;                            // Berechnet die Analysekennzahlen.
  public readonly auffaelligeWerte = logik.auffaelligeWerte;                // Filtert auffällige Laborwerte.
  public readonly relevanteTendenzen = logik.relevanteTendenzen;            // Ermittelt relevante Trendwerte.
  public readonly trendMethodik = logik.trendMethodik;                      // Beschreibt die Trendmethodik.
  public readonly referenzMethodik = logik.referenzMethodik;                // Beschreibt die Referenzmethodik.
  public readonly detailChartBeschreibung = logik.detailChartBeschreibung;  // Beschreibt das Detaildiagramm.
  public readonly statusKlasse = logik.statusKlasse;                        // Erzeugt die Statusklasse.
  public readonly trendKlasse = logik.trendKlasse;                          // Erzeugt die Trendklasse.
  public readonly messwert = logik.messwert;                                // Formatiert Messwert und Einheit.
  public readonly delta = logik.delta;                                      // Formatiert Veränderungen.
  public readonly aufbereitungsScore = logik.aufbereitungsScore;            // Berechnet den Aufbereitungsscore.
  public readonly scoreGradient = logik.scoreGradient;                      // Erzeugt den Score-Verlauf.
  public readonly verteilungsGradient = logik.verteilungsGradient;          // Erzeugt den Verteilungsverlauf.
  public readonly statusAnzahl = logik.statusAnzahl;                        // Zählt Werte eines Status.
  public readonly reviewAnzahl = logik.reviewAnzahl;                        // Zählt offene Review-Werte.
  public readonly trendAnzahl = logik.trendAnzahl;                          // Zählt relevante Trends.
  public readonly trendIcon = logik.trendIcon;                              // Liefert das Trend-Symbol.
  public readonly analyseZielRoute = logik.analyseZielRoute;                // Bestimmt die nächste Zielroute.
  public readonly naechsterAnalyseSchritt = logik.naechsterAnalyseSchritt;  // Bestimmt den nächsten Arbeitsschritt.
  public readonly analyseFokusText = logik.analyseFokusText;                // Beschreibt den Analysefokus.
  public readonly statusLabel = logik.statusLabel;                          // Übersetzt den Status.
  public readonly trendLabel = logik.trendLabel;                            // Übersetzt den Trend.
  public readonly gruppenGesamt = logik.gruppenGesamt;                      // Berechnet die Gruppensumme.
  public readonly gruppenBreite = logik.gruppenBreite;                      // Berechnet den Gruppenanteil.

  /** Reine Diagramm- und SVG-Hilfsfunktionen. */
  public readonly markerPosition = diagramm.markerPosition;                            // Berechnet die Markerposition.
  public readonly referenzStart = diagramm.referenzStart;                              // Berechnet den Referenzstart.
  public readonly referenzBreite = diagramm.referenzBreite;                            // Berechnet die Referenzbreite.
  public readonly verlaufPfad = diagramm.verlaufPfad;                                  // Erzeugt den Detailverlaufspfad.
  public readonly punktX = diagramm.punktX;                                            // Berechnet die X-Koordinate.
  public readonly punktY = diagramm.punktY;                                            // Berechnet die Y-Koordinate.
  public readonly referenzBandY = diagramm.referenzBandY;                              // Berechnet die Referenzbandposition.
  public readonly referenzBandHoehe = diagramm.referenzBandHoehe;                      // Berechnet die Referenzbandhöhe.
  public readonly normalisiertePosition = diagramm.normalisiertePosition;              // Liefert die normalisierte Markerposition.
  public readonly normalisierteVerlaufPfad = diagramm.normalisierteVerlaufPfad;        // Erzeugt den normalisierten Verlaufspfad.
  public readonly istSnapshotVerlauf = diagramm.istSnapshotVerlauf;                    // Prüft einen Snapshot-Verlauf.
  public readonly overlayBeschreibung = diagramm.overlayBeschreibung;                  // Beschreibt das Overlay-Diagramm.
  public readonly normalisierterPunktX = diagramm.normalisierterPunktX;                // Berechnet die normalisierte X-Koordinate.
  public readonly normalisierterPunktY = diagramm.normalisierterPunktY;                // Berechnet die normalisierte Y-Koordinate.
  public readonly normalisierterLetzterPunktX = diagramm.normalisierterLetzterPunktX;  // Liefert die letzte X-Koordinate.
  public readonly normalisierterLetzterPunktY = diagramm.normalisierterLetzterPunktY;  // Liefert die letzte Y-Koordinate.
  public readonly wertFarbe = diagramm.wertFarbe;                                      // Validiert die Linienfarbe.
  public readonly zahlKurz = diagramm.zahlKurz;                                        // Formatiert eine Zahl kompakt.

  /** Liefert gefilterte und priorisierte Laborwerte. */
  public gefilterteWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return ansicht.werte.filter((wert) => this.passtZuFilter(wert)).sort((a, b) => logik.sortierwert(b) - logik.sortierwert(a));
  }

  /** Liefert die priorisierte Wertliste für Auswahlbereiche. */
  public topWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return logik.topWerte(ansicht);
  }

  /** Liefert die gefilterte Wertliste für die Verlaufsauswahl. */
  public overlayWertAuswahl(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    const status = this.overlayStatus();
    return this.topWerte(ansicht).filter((wert) => status === 'alle' || wert.status === status);
  }

  /** Liefert die aktuell aktiven Verlaufslinien. */
  public ausgewaehlteOverlayWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    const sichtbareWerte = this.topWerte(ansicht);
    const aktiveIds = this.aktiveOverlayWertIds().filter((id) => sichtbareWerte.some((wert) => wert.id === id));

    if (!this.overlayAuswahlManuell() && aktiveIds.length === 0) {
      return sichtbareWerte.slice(0, logik.MAX_AKTIVE_OVERLAY_WERTE);
    }

    return aktiveIds.map((id) => sichtbareWerte.find((wert) => wert.id === id)).filter((wert): wert is AuswertungLaborwert => Boolean(wert));
  }

  /** Prüft, ob ein Wert im normalisierten Verlauf aktiv ist. */
  public istOverlayWertAktiv(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): boolean {
    return this.ausgewaehlteOverlayWerte(ansicht).some((eintrag) => eintrag.id === wert.id);
  }

  /** Schaltet einen Wert für den normalisierten Verlauf ein oder aus. */
  public overlayWertUmschalten(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): void {
    const sichtbareWerte = this.topWerte(ansicht);
    const sichtbareIds = sichtbareWerte.map((eintrag) => eintrag.id);
    const standardIds = sichtbareWerte.slice(0, logik.MAX_AKTIVE_OVERLAY_WERTE).map((eintrag) => eintrag.id);
    const basisIds = this.overlayAuswahlManuell() ? this.aktiveOverlayWertIds() : standardIds;
    const aktuelleIds = basisIds.filter((id) => sichtbareIds.includes(id));

    this.overlayAuswahlManuell.set(true);
    this.aktiveOverlayWertIds.set(aktuelleIds.includes(wert.id) ? aktuelleIds.filter((id) => id !== wert.id) : [...aktuelleIds, wert.id].slice(0, logik.MAX_AKTIVE_OVERLAY_WERTE));
    this.diagrammNeuZeichnen();
  }

  /** Aktiviert alle sichtbaren Werte im normalisierten Verlauf. */
  public alleOverlayWerteAktivieren(ansicht: AuswertungViewModel): void {
    this.overlayAuswahlManuell.set(true);
    this.aktiveOverlayWertIds.set(this.topWerte(ansicht).slice(0, logik.MAX_AKTIVE_OVERLAY_WERTE).map((eintrag) => eintrag.id));
    this.diagrammNeuZeichnen();
  }

  /** Deaktiviert alle Werte im normalisierten Verlauf. */
  public alleOverlayWerteDeaktivieren(): void {
    this.overlayAuswahlManuell.set(true);
    this.aktiveOverlayWertIds.set([]);
    this.overlayFokusWertId.set(null);
    this.diagrammNeuZeichnen();
  }

  /** Setzt den Statusfilter der Overlay-Auswahl. */
  public overlayStatusSetzen(status: logik.AuswertungStatusFilter): void {
    this.overlayStatus.set(status);
  }

  /** Wählt einen Overlay-Wert aus und schaltet dessen Hervorhebung um. */
  public overlayWertHervorheben(wert: AuswertungLaborwert): void {
    this.wertAuswaehlen(wert);
    this.overlayFokusWertId.set(this.overlayFokusWertId() === wert.id ? null : wert.id);
  }

  /** Prüft, ob ein Overlay-Wert aktuell fokussiert ist. */
  public istOverlayWertFokussiert(wert: AuswertungLaborwert): boolean {
    return this.overlayFokusWertId() === wert.id;
  }

  /** Prüft, ob ein Overlay-Wert wegen eines anderen Fokus ausgegraut wird. */
  public istOverlayWertAusgegraut(wert: AuswertungLaborwert): boolean {
    const fokusId = this.overlayFokusWertId();
    return Boolean(fokusId && fokusId !== wert.id);
  }

  /** Liefert die maximale Anzahl gleichzeitig aktiver Overlay-Linien. */
  public maximaleOverlayWerte(): number {
    return logik.MAX_AKTIVE_OVERLAY_WERTE;
  }

  /** Liefert priorisierte Laborwerte für die Referenzfeld-Darstellung. */
  public referenzfeldWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return this.topWerte(ansicht);
  }

  /** Ermittelt den aktiven Laborwert mit robustem Fallback auf sichtbare Werte. */
  public aktiverWert(ansicht: AuswertungViewModel): AuswertungLaborwert | null {
    const sichtbareWerte = this.gefilterteWerte(ansicht);
    return sichtbareWerte.find((wert) => wert.id === this.aktiverWertId()) ?? sichtbareWerte[0] ?? ansicht.werte[0] ?? null;
  }

  /** Setzt die aktive Laborwertgruppe. */
  public gruppeSetzen(gruppe: string): void {
    this.aktiveGruppe.set(gruppe);
  }

  /** Setzt den aktiven Statusfilter der Werteliste. */
  public statusSetzen(status: logik.AuswertungStatusFilter): void {
    this.aktiverStatus.set(status);
  }

  /** Wählt einen Laborwert aus und startet seine Diagrammanimation erneut. */
  public wertAuswaehlen(wert: AuswertungLaborwert): void {
    this.aktiverWertId.set(wert.id);
    this.diagrammNeuZeichnen();
  }

  /** Schaltet den Filter für ausschließlich geprüfte Werte um. */
  public gepruefteUmschalten(): void {
    this.nurGepruefteWerte.update((wert) => !wert);
  }

  /** Erzeugt die CSS-Klasse für den Review-Status eines Laborwerts. */
  public reviewKlasse(status: AuswertungReviewStatus): string {
    return status === 'review' ? 'is-review' : 'is-normal';
  }

  /** Prüft einen Laborwert gegen Gruppe, Status und Review-Filter. */
  private passtZuFilter(wert: AuswertungLaborwert): boolean {
    const gruppePasst = this.aktiveGruppe() === 'alle' || wert.gruppe === this.aktiveGruppe();
    const statusPasst = this.aktiverStatus() === 'alle' || wert.status === this.aktiverStatus();
    const reviewPasst = !this.nurGepruefteWerte() || wert.reviewStatus === 'geprueft';
    return gruppePasst && statusPasst && reviewPasst;
  }

  /** Erhöht das Animationstoken und erzwingt das erneute Zeichnen der Diagramme. */
  private diagrammNeuZeichnen(): void {
    this.diagrammAnimationsToken.update((token) => token + 1);
  }
}
