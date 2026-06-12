/* src/app/pages/analyse-page/analyse-page.component.ts */

/**
 * @file Routenseite für fachliche Laborwertauswertung.
 * @module AnalysePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuswertungGruppe, AuswertungKennzahl, AuswertungLaborwert, AuswertungPatient, AuswertungReviewStatus, AuswertungTrend, AuswertungViewModel } from '../../core/models/auswertung.model';
import { LaborwertPrioritaet, LaborwertStatus } from '../../core/models/laborwert.model';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';

/** Statusfilter der Auswertungsroute. */
type AuswertungStatusFilter = LaborwertStatus | 'alle';

/** Filter für die Patientenauswahl. */
type AuswertungPatientFilter = 'alle' | 'mehrere' | 'ocr';

/** Route `/auswertung` mit analytischer Laborwertansicht. */
@Component({
  selector: 'dd-analyse-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './analyse-page.component.html',
  styleUrl: './analyse-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysePageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Fachliche Auswertungsansicht aus Mockdaten oder später API. */
  protected readonly auswertung$ = this.datenDashboardApi.ladeAuswertung();

  /** Aktiver Patient für die Auswertungsfilterung. */
  public readonly aktiverPatientId: WritableSignal<string> = signal('patient-demo-01');

  /** Sichtbarkeit des Patientenauswahl-Overlays. */
  public readonly patientenOverlayOffen: WritableSignal<boolean> = signal(false);

  /** Suchbegriff der Patientenauswahl. */
  public readonly patientenSuche: WritableSignal<string> = signal('');

  /** Aktiver Patientenauswahlfilter. */
  public readonly patientenFilter: WritableSignal<AuswertungPatientFilter> = signal('alle');

  /** Animations-Token für erneutes Zeichnen des Verlaufs. */
  public readonly diagrammAnimationsToken: WritableSignal<number> = signal(0);

  /** Aktive Gruppe für Tabellen und Detailansicht. */
  public readonly aktiveGruppe: WritableSignal<string> = signal('alle');

  /** Aktiver Statusfilter. */
  public readonly aktiverStatus: WritableSignal<AuswertungStatusFilter> = signal('alle');

  /** Aktuell selektierter Laborwert. */
  public readonly aktiverWertId: WritableSignal<string> = signal('auswertung-ldl');

  /** Schaltet ungeprüfte Werte in der Auswertung aus. */
  public readonly nurGepruefteWerte: WritableSignal<boolean> = signal(false);

  /** Patientenauswahlfilter für das Overlay. */
  public readonly patientFilterOptionen: { key: AuswertungPatientFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'mehrere', label: 'Mehrere Befunde' },
    { key: 'ocr', label: 'OCR' }
  ];

  /** Statusfilter für die Oberfläche. */
  public readonly statusFilter: { key: AuswertungStatusFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'hoch', label: 'Erhöht' },
    { key: 'niedrig', label: 'Niedrig' },
    { key: 'review', label: 'Review' },
    { key: 'normal', label: 'Normal' }
  ];

  /** Erzeugt KPI-Karten für die Analyse. */
  public kennzahlen(ansicht: AuswertungViewModel): AuswertungKennzahl[] {
    const auffaellig = ansicht.werte.filter((wert: AuswertungLaborwert) => wert.status === 'hoch' || wert.status === 'niedrig').length;
    const stark = ansicht.werte.filter((wert: AuswertungLaborwert) => wert.prioritaet === 'hoch').length;
    const review = ansicht.werte.filter((wert: AuswertungLaborwert) => wert.reviewStatus === 'review').length;
    const trend = ansicht.werte.filter((wert: AuswertungLaborwert) => Math.abs(wert.veraenderungProzent) >= 10).length;

    return [
      { label: 'Laborwerte', wert: ansicht.werte.length, hinweis: 'auswertbar', icon: 'science', status: 'info' },
      { label: 'Auffällig', wert: auffaellig, hinweis: 'außer Referenz', icon: 'priority_high', status: 'warning' },
      { label: 'Stark auffällig', wert: stark, hinweis: 'hoch priorisiert', icon: 'emergency_home', status: 'danger' },
      { label: 'Review offen', wert: review, hinweis: 'ärztlich prüfen', icon: 'fact_check', status: 'review' },
      { label: 'Trendwechsel', wert: trend, hinweis: 'relevante Änderung', icon: 'trending_up', status: 'success' }
    ];
  }

  /** Liefert gefilterte und priorisierte Laborwerte. */
  public gefilterteWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return ansicht.werte.filter((wert: AuswertungLaborwert) => this.passtZuFilter(wert)).sort((a: AuswertungLaborwert, b: AuswertungLaborwert) => this.sortierwert(b) - this.sortierwert(a));
  }

  /** Liefert den aktuell selektierten Wert oder den ersten sichtbaren Wert. */
  public aktiverWert(ansicht: AuswertungViewModel): AuswertungLaborwert | null {
    const sichtbareWerte = this.gefilterteWerte(ansicht);
    return sichtbareWerte.find((wert: AuswertungLaborwert) => wert.id === this.aktiverWertId()) ?? sichtbareWerte[0] ?? ansicht.werte[0] ?? null;
  }

  /** Liefert den aktuell gewählten Patienten. */
  public aktiverPatient(ansicht: AuswertungViewModel): AuswertungPatient {
    return ansicht.patienten.find((patient: AuswertungPatient) => patient.id === this.aktiverPatientId()) ?? ansicht.patienten[0];
  }

  /** Liefert gefilterte Patienten für das Overlay. */
  public gefiltertePatienten(ansicht: AuswertungViewModel): AuswertungPatient[] {
    const suche = this.patientenSuche().trim().toLowerCase();
    return ansicht.patienten.filter((patient: AuswertungPatient) => this.patientFilterPasst(patient, suche));
  }

  /** Öffnet oder schließt die Patientenauswahl. */
  public patientenOverlayUmschalten(): void {
    this.patientenOverlayOffen.update((wert: boolean) => !wert);
  }

  /** Schließt die Patientenauswahl. */
  public patientenOverlaySchliessen(): void {
    this.patientenOverlayOffen.set(false);
  }

  /** Aktualisiert die Patientensuche. */
  public patientenSucheAendern(event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    this.patientenSuche.set(eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '').slice(0, 80));
  }

  /** Setzt den Patientenauswahlfilter. */
  public patientenFilterSetzen(filter: AuswertungPatientFilter): void {
    this.patientenFilter.set(filter);
  }

  /** Setzt den aktiven Patienten. */
  public patientSetzen(patient: AuswertungPatient): void {
    this.aktiverPatientId.set(patient.id);
    this.aktiverWertId.set('auswertung-ldl');
    this.diagrammAnimationsToken.update((wert: number) => wert + 1);
    this.patientenOverlaySchliessen();
  }

  /** Setzt die aktive Gruppe. */
  public gruppeSetzen(gruppe: string): void {
    this.aktiveGruppe.set(gruppe);
  }

  /** Setzt den aktiven Statusfilter. */
  public statusSetzen(status: AuswertungStatusFilter): void {
    this.aktiverStatus.set(status);
  }

  /** Setzt den aktiven Laborwert. */
  public wertAuswaehlen(wert: AuswertungLaborwert): void {
    this.aktiverWertId.set(wert.id);
    this.diagrammAnimationsToken.update((token: number) => token + 1);
  }

  /** Schaltet zwischen allen und nur geprüften Werten. */
  public gepruefteUmschalten(): void {
    this.nurGepruefteWerte.update((wert: boolean) => !wert);
  }

  /** Gibt eine CSS-Klasse für Laborwertstatus zurück. */
  public statusKlasse(status: LaborwertStatus): string {
    return `is-${status}`;
  }

  /** Gibt eine CSS-Klasse für Trends zurück. */
  public trendKlasse(trend: AuswertungTrend): string {
    return `is-${trend}`;
  }

  /** Gibt eine CSS-Klasse für Reviewstatus zurück. */
  public reviewKlasse(status: AuswertungReviewStatus): string {
    return status === 'review' ? 'is-review' : 'is-normal';
  }

  /** Formatiert einen Messwert mit Einheit. */
  public messwert(wert: number, einheit: string): string {
    return `${this.zahl(wert)} ${einheit}`;
  }

  /** Formatiert Vorzeichenwerte. */
  public delta(wert: number, einheit = ''): string {
    const vorzeichen = wert > 0 ? '+' : '';
    const suffix = einheit ? ` ${einheit}` : '';
    return `${vorzeichen}${this.zahl(wert)}${suffix}`;
  }

  /** Berechnet die horizontale Markerposition im erweiterten Referenzband. */
  public markerPosition(wert: AuswertungLaborwert): string {
    const grenzen = this.skalaGrenzen(wert);
    return `${this.prozent(wert.wert, grenzen.min, grenzen.max)}%`;
  }

  /** Berechnet den linken Start des Referenzbereichs im Range-Band. */
  public referenzStart(wert: AuswertungLaborwert): string {
    const grenzen = this.skalaGrenzen(wert);
    return `${this.prozent(wert.referenzMin, grenzen.min, grenzen.max)}%`;
  }

  /** Berechnet die Breite des Referenzbereichs im Range-Band. */
  public referenzBreite(wert: AuswertungLaborwert): string {
    const grenzen = this.skalaGrenzen(wert);
    return `${this.prozent(wert.referenzMax, grenzen.min, grenzen.max) - this.prozent(wert.referenzMin, grenzen.min, grenzen.max)}%`;
  }

  /** Wandelt Verlaufspunkte in SVG-Polyline-Punkte um. */
  public verlaufPunkte(wert: AuswertungLaborwert): string {
    return wert.verlauf.map((punkt, index) => `${this.punktX(wert, index)},${this.punktY(wert, punkt.wert)}`).join(' ');
  }

  /** Berechnet X-Koordinate eines Verlaufspunkts. */
  public punktX(wert: AuswertungLaborwert, index: number): number {
    const maxIndex = Math.max(wert.verlauf.length - 1, 1);
    return Math.round((46 + (index / maxIndex) * 392) * 10) / 10;
  }

  /** Berechnet Y-Koordinate eines Verlaufspunkts. */
  public punktY(wert: AuswertungLaborwert, messwert: number): number {
    const grenzen = this.diagrammGrenzen(wert);
    return Math.round((154 - this.prozent(messwert, grenzen.min, grenzen.max) * 1.2) * 10) / 10;
  }

  /** Berechnet Y-Position des Referenzbands im Diagramm. */
  public referenzBandY(wert: AuswertungLaborwert): number {
    return this.punktY(wert, wert.referenzMax);
  }

  /** Berechnet Höhe des Referenzbands im Diagramm. */
  public referenzBandHoehe(wert: AuswertungLaborwert): number {
    return Math.max(6, this.punktY(wert, wert.referenzMin) - this.punktY(wert, wert.referenzMax));
  }

  /** Gibt Gesamtanzahl einer Gruppe zurück. */
  public gruppenGesamt(gruppe: AuswertungGruppe): number {
    return Math.max(gruppe.normal + gruppe.niedrig + gruppe.hoch + gruppe.review, 1);
  }

  /** Berechnet Segmentbreite für die Gruppenmatrix. */
  public gruppenBreite(wert: number, gruppe: AuswertungGruppe): string {
    return `${Math.round((wert / this.gruppenGesamt(gruppe)) * 100)}%`;
  }

  /** Prüft, ob ein Patient zum aktiven Overlayfilter passt. */
  private patientFilterPasst(patient: AuswertungPatient, suche: string): boolean {
    const suchtext = `${patient.name} ${patient.kontext}`.toLowerCase();
    const suchePasst = !suche || suchtext.includes(suche);
    const filterPasst = this.patientenFilter() === 'alle' || (this.patientenFilter() === 'mehrere' && patient.befunde > 1) || (this.patientenFilter() === 'ocr' && patient.quelle === 'ocr');
    return suchePasst && filterPasst;
  }

  /** Prüft, ob ein Wert zum aktiven Filter passt. */
  private passtZuFilter(wert: AuswertungLaborwert): boolean {
    const gruppePasst = this.aktiveGruppe() === 'alle' || wert.gruppe === this.aktiveGruppe();
    const statusPasst = this.aktiverStatus() === 'alle' || wert.status === this.aktiverStatus();
    const reviewPasst = !this.nurGepruefteWerte() || wert.reviewStatus === 'geprueft';
    return gruppePasst && statusPasst && reviewPasst;
  }

  /** Berechnet Sortiergewicht für priorisierte Anzeige. */
  private sortierwert(wert: AuswertungLaborwert): number {
    return this.prioritaetGewicht(wert.prioritaet) + Math.abs(wert.abweichungProzent) + (wert.reviewStatus === 'review' ? 30 : 0) + Math.abs(wert.veraenderungProzent);
  }

  /** Gibt Prioritätsgewicht zurück. */
  private prioritaetGewicht(prioritaet: LaborwertPrioritaet): number {
    return prioritaet === 'hoch' ? 200 : prioritaet === 'mittel' ? 100 : 0;
  }

  /** Berechnet Prozentposition. */
  private prozent(wert: number, min: number, max: number): number {
    return Math.min(100, Math.max(0, ((wert - min) / Math.max(max - min, 1)) * 100));
  }

  /** Erzeugt erweiterte Grenzen für horizontale Range-Anzeige. */
  private skalaGrenzen(wert: AuswertungLaborwert): { min: number; max: number } {
    const span = Math.max(wert.referenzMax - wert.referenzMin, Math.abs(wert.wert - wert.referenzMax), 1);
    const min = Math.min(wert.referenzMin, wert.wert) - span * 0.18;
    const max = Math.max(wert.referenzMax, wert.wert) + span * 0.18;
    return { min, max };
  }

  /** Erzeugt Diagrammgrenzen aus Referenz und Verlauf. */
  private diagrammGrenzen(wert: AuswertungLaborwert): { min: number; max: number } {
    const daten = [...wert.verlauf.map((punkt) => punkt.wert), wert.referenzMin, wert.referenzMax];
    const minWert = Math.min(...daten);
    const maxWert = Math.max(...daten);
    const padding = Math.max((maxWert - minWert) * 0.18, 1);
    return { min: minWert - padding, max: maxWert + padding };
  }

  /** Formatiert Zahlen kompakt deutsch. */
  private zahl(wert: number): string {
    return Number.isInteger(wert) ? `${wert}` : wert.toFixed(1).replace('.', ',');
  }
}
