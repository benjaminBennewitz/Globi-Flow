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
import { AuswertungGruppe, AuswertungKennzahl, AuswertungLaborwert, AuswertungReviewStatus, AuswertungTrend, AuswertungViewModel } from '../../core/models/auswertung.model';
import { LaborwertPrioritaet, LaborwertStatus } from '../../core/models/laborwert.model';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { PatientContextService } from '../../core/services/patient-context.service';

/** Statusfilter der Auswertungsroute. */
type AuswertungStatusFilter = LaborwertStatus | 'alle';

/** Maximale Anzahl gleichzeitig überlagerter Verlaufslinien. */
const MAX_AKTIVE_OVERLAY_WERTE = 5;

/** Relevanzschwelle für Trendwechsel im Befundvergleich. */
const TRENDWECHSEL_SCHWELLE_PROZENT = 10;


/** Route `/auswertung` mit analytischer Laborwertansicht. */
@Component({
  selector: 'gf-analyse-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './analyse-page.component.html',
  styleUrl: './analyse-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysePageComponent {
  /** API-bereiter Datenservice. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Globaler Patientenkontext. */
  public readonly patientContext = inject(PatientContextService);

  /** Fachliche Auswertungsansicht zum aktiven Patient- und Befundkontext. */
  protected readonly auswertung$ = combineLatest([toObservable(this.patientContext.aktiverBefundId), toObservable(this.patientContext.aktiverPatientId)]).pipe(
    switchMap(([befundId, patientId]) => this.globiFlowApi.ladeAuswertung(befundId, patientId))
  );

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

  /** Manuell aktivierte Werte für den normalisierten Verlauf. */
  public readonly aktiveOverlayWertIds: WritableSignal<string[]> = signal([]);

  /** Statusfilter für die Oberfläche. */
  public readonly statusFilter: { key: AuswertungStatusFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'hoch', label: 'Erhöht' },
    { key: 'niedrig', label: 'Niedrig' },
    { key: 'review', label: 'Review' },
    { key: 'normal', label: 'Normal' }
  ];

  /** Prüft, ob ein echter Vorbefund für den aktuellen Kontext existiert. */
  public hatVergleich(ansicht: AuswertungViewModel): boolean {
    return Boolean(ansicht.hatVergleich && ansicht.vergleichsBefund);
  }

  /** Prüft, ob ein Einzelwert einen echten Vorbefund besitzt. */
  public hatWertVergleich(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): boolean {
    return this.hatVergleich(ansicht) && wert.hatVergleich !== false;
  }

  /** Gibt den Vergleichsbefund lesbar aus. */
  public vergleichsBefundLabel(ansicht: AuswertungViewModel): string {
    return this.hatVergleich(ansicht) ? ansicht.vergleichsBefund : 'Kein Vorbefund';
  }

  /** Gibt den kompakten Trendtext für eine Wertzeile zurück. */
  public trendDeltaText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
    return this.hatWertVergleich(wert, ansicht) ? `${this.delta(wert.veraenderungProzent)}%` : 'kein Verlauf';
  }

  /** Gibt den Vorwert lesbar aus. */
  public vorherigerWertText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
    return this.hatWertVergleich(wert, ansicht) ? this.messwert(wert.vorherigerWert, wert.einheit) : 'Kein Vorbefund';
  }

  /** Gibt die Änderung lesbar aus. */
  public aenderungKurzText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
    return this.hatWertVergleich(wert, ansicht) ? `${this.delta(wert.veraenderungAbsolut, wert.einheit)} · ${this.delta(wert.veraenderungProzent)}%` : 'kein Verlauf';
  }

  /** Beschreibt den aktiven Vergleichszustand. */
  public vergleichBeschreibung(ansicht: AuswertungViewModel): string {
    return this.hatVergleich(ansicht) ? `Aktueller Befund gegen ${ansicht.vergleichsBefund} mit absoluter und prozentualer Veränderung.` : 'Noch kein echter Vorbefund für diesen Patienten vorhanden.';
  }

  /** Erzeugt transparente KPI-Karten für die Analyse. */
  public kennzahlen(ansicht: AuswertungViewModel): AuswertungKennzahl[] {
    const auffaellig = this.auffaelligeWerte(ansicht).length;
    const stark = ansicht.werte.filter((wert: AuswertungLaborwert) => wert.prioritaet === 'hoch').length;
    const review = this.reviewAnzahl(ansicht);
    const trend = this.hatVergleich(ansicht) ? this.relevanteTendenzen(ansicht).length : 0;
    const trendHinweis = this.hatVergleich(ansicht) ? `≥ ${TRENDWECHSEL_SCHWELLE_PROZENT}% zum Vergleich` : 'kein Vorbefund';
    const trendBeschreibung = this.hatVergleich(ansicht) ? `Aktueller Befund verglichen mit ${ansicht.vergleichsBefund}. Gezählt werden Werte ab ±${TRENDWECHSEL_SCHWELLE_PROZENT}% Veränderung.` : 'Für den aktiven Patienten gibt es im ausgewählten Kontext keinen vorherigen Befund. Trendwechsel werden deshalb nicht gezählt.';

    return [
      { label: 'Laborwerte', wert: ansicht.werte.length, hinweis: 'aktueller Befund', beschreibung: 'Alle normalisierten Werte des ausgewählten Befunds, die fachlich ausgewertet werden können.', icon: 'science', status: 'info' },
      { label: 'Auffällig', wert: auffaellig, hinweis: 'außer Referenz', beschreibung: 'Werte mit Status erhöht oder niedrig. Grundlage ist der erkannte Referenzbereich des aktuellen Befunds.', icon: 'priority_high', status: 'warning' },
      { label: 'Stark auffällig', wert: stark, hinweis: 'hoch priorisiert', beschreibung: 'Werte mit hoher Priorität. Diese Priorität kommt aus den Backend-Regeln und berücksichtigt Abweichung, Status und Prüfbedarf.', icon: 'emergency_home', status: 'danger' },
      { label: 'Review offen', wert: review, hinweis: 'ärztlich prüfen', beschreibung: 'Werte mit offenem Review-Status. Sie sollten vor Freigabe und Patientenbericht geprüft werden.', icon: 'fact_check', status: 'review' },
      { label: 'Trendwechsel', wert: trend, hinweis: trendHinweis, beschreibung: trendBeschreibung, icon: 'trending_up', status: 'success' }
    ];
  }

  /** Liefert gefilterte und priorisierte Laborwerte. */
  public gefilterteWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return ansicht.werte.filter((wert: AuswertungLaborwert) => this.passtZuFilter(wert)).sort((a: AuswertungLaborwert, b: AuswertungLaborwert) => this.sortierwert(b) - this.sortierwert(a));
  }

  /** Liefert alle auffälligen Werte des aktuellen Befunds. */
  public auffaelligeWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return ansicht.werte.filter((wert: AuswertungLaborwert) => wert.status === 'hoch' || wert.status === 'niedrig');
  }

  /** Liefert die priorisierte Wertliste für die manuelle Verlaufsauswahl. */
  public topWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return [...ansicht.werte].sort((a: AuswertungLaborwert, b: AuswertungLaborwert) => this.sortierwert(b) - this.sortierwert(a));
  }

  /** Liefert die aktuell aktiven Verlaufslinien. */
  public ausgewaehlteOverlayWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    const sichtbareWerte = this.topWerte(ansicht);
    const aktiveIds = this.aktiveOverlayWertIds().filter((id: string) => sichtbareWerte.some((wert: AuswertungLaborwert) => wert.id === id));

    if (aktiveIds.length === 0) {
      return sichtbareWerte.slice(0, MAX_AKTIVE_OVERLAY_WERTE);
    }

    return aktiveIds.map((id: string) => sichtbareWerte.find((wert: AuswertungLaborwert) => wert.id === id)).filter((wert: AuswertungLaborwert | undefined): wert is AuswertungLaborwert => Boolean(wert));
  }

  /** Prüft, ob ein Wert im normalisierten Verlauf aktiv ist. */
  public istOverlayWertAktiv(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): boolean {
    return this.ausgewaehlteOverlayWerte(ansicht).some((eintrag: AuswertungLaborwert) => eintrag.id === wert.id);
  }

  /** Schaltet einen Wert für den normalisierten Verlauf ein oder aus. */
  public overlayWertUmschalten(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): void {
    const sichtbareWerte = this.topWerte(ansicht);
    const sichtbareIds = sichtbareWerte.map((eintrag: AuswertungLaborwert) => eintrag.id);
    const gespeicherteIds = this.aktiveOverlayWertIds();
    const standardIds = sichtbareWerte.slice(0, MAX_AKTIVE_OVERLAY_WERTE).map((eintrag: AuswertungLaborwert) => eintrag.id);
    const aktuelleIds = (gespeicherteIds.length > 0 ? gespeicherteIds : standardIds).filter((id: string) => sichtbareIds.includes(id));

    if (aktuelleIds.includes(wert.id)) {
      this.aktiveOverlayWertIds.set(aktuelleIds.filter((id: string) => id !== wert.id));
      this.diagrammAnimationsToken.update((token: number) => token + 1);
      return;
    }

    const naechsteIds = [...aktuelleIds, wert.id].slice(-MAX_AKTIVE_OVERLAY_WERTE);
    this.aktiveOverlayWertIds.set(naechsteIds);
    this.diagrammAnimationsToken.update((token: number) => token + 1);
  }

  /** Liefert die Anzahl maximal aktivierbarer Verlaufslinien. */
  public maximaleOverlayWerte(): number {
    return MAX_AKTIVE_OVERLAY_WERTE;
  }

  /** Liefert Werte mit relevanter Veränderung zum Vergleichsbefund. */
  public relevanteTendenzen(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    if (!this.hatVergleich(ansicht)) {
      return [];
    }

    return this.topWerte(ansicht).filter((wert: AuswertungLaborwert) => this.hatWertVergleich(wert, ansicht) && Math.abs(wert.veraenderungProzent) >= TRENDWECHSEL_SCHWELLE_PROZENT).sort((a: AuswertungLaborwert, b: AuswertungLaborwert) => Math.abs(b.veraenderungProzent) - Math.abs(a.veraenderungProzent));
  }

  /** Liefert Werte für das Referenzfeld-Menü. */
  public referenzfeldWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
    return this.topWerte(ansicht);
  }

  /** Beschreibt die Trendlogik für die Oberfläche. */
  public trendMethodik(ansicht: AuswertungViewModel): string {
    if (!this.hatVergleich(ansicht)) {
      return 'Für diese Testperson liegt im ausgewählten Kontext kein vorheriger Befund vor. Sobald ein zweiter Befund vorhanden ist, werden echte Veränderungen angezeigt.';
    }

    return `Verglichen wird der aktuelle Befund mit ${ansicht.vergleichsBefund}. Relevant ist eine Veränderung ab ±${TRENDWECHSEL_SCHWELLE_PROZENT}%.`;
  }

  /** Beschreibt die Referenzfeldlogik für die Oberfläche. */
  public referenzMethodik(): string {
    return 'Marker links bedeutet eher niedrig, Marker mittig liegt im Referenzbereich, Marker rechts eher erhöht.';
  }

  /** Liefert den aktuell selektierten Wert oder den ersten sichtbaren Wert. */
  public aktiverWert(ansicht: AuswertungViewModel): AuswertungLaborwert | null {
    const sichtbareWerte = this.gefilterteWerte(ansicht);
    return sichtbareWerte.find((wert: AuswertungLaborwert) => wert.id === this.aktiverWertId()) ?? sichtbareWerte[0] ?? ansicht.werte[0] ?? null;
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

  /** Wandelt Verlaufspunkte in einen weich gezogenen SVG-Pfad um. */
  public verlaufPfad(wert: AuswertungLaborwert): string {
    return this.weicherSvgPfad(wert.verlauf.map((punkt, index) => ({ x: this.punktX(wert, index), y: this.punktY(wert, punkt.wert) })));
  }

  /** Berechnet X-Koordinate eines Verlaufspunkts. */
  public punktX(wert: AuswertungLaborwert, index: number): number {
    if (wert.verlauf.length <= 1) {
      return 242;
    }

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


  /** Berechnet einen kompakten Qualitätswert für die Datenaufbereitung. */
  public aufbereitungsScore(ansicht: AuswertungViewModel): number {
    const confidenceSumme = ansicht.werte.reduce((summe: number, wert: AuswertungLaborwert) => summe + wert.confidence, 0);
    const durchschnitt = confidenceSumme / Math.max(ansicht.werte.length, 1);
    const reviewAbzug = this.reviewAnzahl(ansicht) * 4;
    return Math.max(0, Math.min(100, Math.round(durchschnitt - reviewAbzug)));
  }

  /** Liefert den CSS-Gradienten für den Qualitätsring. */
  public scoreGradient(ansicht: AuswertungViewModel): string {
    const score = this.aufbereitungsScore(ansicht);
    return `conic-gradient(var(--gf-color-primary) ${score * 3.6}deg, var(--gf-color-bg) 0deg)`;
  }

  /** Liefert den CSS-Gradienten für die Statusverteilung. */
  public verteilungsGradient(ansicht: AuswertungViewModel): string {
    const gesamt = Math.max(ansicht.werte.length, 1);
    const normal = this.statusAnzahl(ansicht, 'normal') / gesamt * 100;
    const auffaellig = (this.statusAnzahl(ansicht, 'hoch') + this.statusAnzahl(ansicht, 'niedrig')) / gesamt * 100;
    const review = this.statusAnzahl(ansicht, 'review') / gesamt * 100;
    const normalEnde = normal;
    const auffaelligEnde = normal + auffaellig;
    const reviewEnde = normal + auffaellig + review;
    return `conic-gradient(var(--gf-color-success) 0 ${normalEnde}%, var(--gf-color-danger) ${normalEnde}% ${auffaelligEnde}%, var(--gf-color-warning) ${auffaelligEnde}% ${reviewEnde}%, var(--gf-color-outline) ${reviewEnde}% 100%)`;
  }

  /** Zählt Werte mit einem bestimmten Status. */
  public statusAnzahl(ansicht: AuswertungViewModel, status: LaborwertStatus): number {
    return ansicht.werte.filter((wert: AuswertungLaborwert) => wert.status === status).length;
  }

  /** Zählt Werte mit offenem Review. */
  public reviewAnzahl(ansicht: AuswertungViewModel): number {
    return ansicht.werte.filter((wert: AuswertungLaborwert) => wert.reviewStatus === 'review').length;
  }

  /** Zählt Werte mit deutlicher Verlaufstendenz. */
  public trendAnzahl(ansicht: AuswertungViewModel): number {
    return this.relevanteTendenzen(ansicht).length;
  }

  /** Berechnet die normalisierte Position eines Laborwerts im erweiterten Referenzfeld. */
  public normalisiertePosition(wert: AuswertungLaborwert): string {
    const grenzen = this.skalaGrenzen(wert);
    return `${this.prozent(wert.wert, grenzen.min, grenzen.max)}%`;
  }

  /** Liefert ein Richtungssymbol für Trendkarten. */
  public trendIcon(trend: AuswertungTrend): string {
    if (trend === 'steigend') {
      return 'arrow_upward';
    }

    if (trend === 'fallend') {
      return 'arrow_downward';
    }

    return 'trending_flat';
  }

  /** Liefert einen weich gezogenen Verlaufspfad mit normalisierter Skala. */
  public normalisierteVerlaufPfad(wert: AuswertungLaborwert): string {
    return this.weicherSvgPfad(wert.verlauf.map((punkt, index: number) => ({ x: this.normalisierterPunktX(wert, index), y: this.normalisierterPunktY(wert, punkt.wert) })));
  }

  /** Berechnet X-Koordinaten für den normalisierten Overlay-Chart. */
  public normalisierterPunktX(wert: AuswertungLaborwert, index: number): number {
    if (wert.verlauf.length <= 1) {
      return 356;
    }

    const maxIndex = Math.max(wert.verlauf.length - 1, 1);
    return this.runden(86 + (index / maxIndex) * 540);
  }

  /** Berechnet Y-Koordinaten für den normalisierten Overlay-Chart. */
  public normalisierterPunktY(wert: AuswertungLaborwert, messwert: number): number {
    const grenzen = this.skalaGrenzen(wert);
    return this.runden(202 - this.prozent(messwert, grenzen.min, grenzen.max) * 1.64);
  }

  /** Berechnet die X-Koordinate des letzten Overlay-Punkts. */
  public normalisierterLetzterPunktX(wert: AuswertungLaborwert): number {
    return this.normalisierterPunktX(wert, Math.max(wert.verlauf.length - 1, 0));
  }

  /** Berechnet die Y-Koordinate des letzten Overlay-Punkts. */
  public normalisierterLetzterPunktY(wert: AuswertungLaborwert): number {
    const letzterPunkt = wert.verlauf[wert.verlauf.length - 1];
    return this.normalisierterPunktY(wert, letzterPunkt?.wert ?? wert.wert);
  }

  /** Liefert eine stabile Farbreihe für überlagerte Werte. */
  public overlayFarbKlasse(index: number): string {
    return `is-serie-${index % 5}`;
  }

  /** Formatiert Werte für die kompakte Chart-Seitenleiste. */
  public zahlKurz(wert: number): string {
    return this.zahl(wert);
  }

  /** Liefert das nächste sinnvolle Ziel der geführten Auswertung. */
  public analyseZielRoute(ansicht: AuswertungViewModel): string {
    if (this.reviewAnzahl(ansicht) > 0) {
      return '/review';
    }

    return '/berichte';
  }

  /** Liefert die Beschriftung für die nächste Aktion der Analyse. */
  public naechsterAnalyseSchritt(ansicht: AuswertungViewModel): string {
    if (this.reviewAnzahl(ansicht) > 0) {
      return 'Review abschließen';
    }

    if (this.statusAnzahl(ansicht, 'hoch') + this.statusAnzahl(ansicht, 'niedrig') > 0) {
      return 'Patientenbericht vorbereiten';
    }

    return 'Bericht freigeben';
  }

  /** Erklärt, warum die nächste Aktion sinnvoll ist. */
  public analyseFokusText(ansicht: AuswertungViewModel): string {
    const review = this.reviewAnzahl(ansicht);
    const auffaellig = this.statusAnzahl(ansicht, 'hoch') + this.statusAnzahl(ansicht, 'niedrig');

    if (review > 0) {
      return `${review} Wert(e) sind noch nicht sicher genug für Bericht und Verlauf. Diese Werte bleiben sichtbar, sollten aber zuerst geprüft werden.`;
    }

    if (auffaellig > 0) {
      return `${auffaellig} auffällige Wert(e) sind geprüft und können mit Verlauf, Referenzfeld und Patiententext in den Bericht übernommen werden.`;
    }

    return 'Alle sichtbaren Werte sind geprüft und unauffällig. Der Bericht kann als verständliche Zusammenfassung vorbereitet werden.';
  }

  /** Gibt ein lesbares Statuslabel zurück. */
  public statusLabel(status: LaborwertStatus): string {
    const labels: Record<LaborwertStatus, string> = {
      normal: 'Normal',
      hoch: 'Erhöht',
      niedrig: 'Niedrig',
      review: 'Review'
    };

    return labels[status];
  }

  /** Gibt ein lesbares Trendlabel zurück. */
  public trendLabel(trend: AuswertungTrend): string {
    const labels: Record<AuswertungTrend, string> = {
      steigend: 'steigend',
      fallend: 'fallend',
      stabil: 'stabil'
    };

    return labels[trend];
  }

  /** Gibt Gesamtanzahl einer Gruppe zurück. */
  public gruppenGesamt(gruppe: AuswertungGruppe): number {
    return Math.max(gruppe.normal + gruppe.niedrig + gruppe.hoch + gruppe.review, 1);
  }

  /** Berechnet Segmentbreite für die Gruppenmatrix. */
  public gruppenBreite(wert: number, gruppe: AuswertungGruppe): string {
    return `${Math.round((wert / this.gruppenGesamt(gruppe)) * 100)}%`;
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

  /** Erzeugt aus Koordinaten einen ruhigen SVG-Pfad mit weichen Kurven. */
  private weicherSvgPfad(punkte: { x: number; y: number }[]): string {
    if (punkte.length === 0) {
      return '';
    }

    if (punkte.length === 1) {
      const startX = this.runden(Math.max(46, punkte[0].x - 16));
      const endX = this.runden(punkte[0].x + 16);
      return `M ${startX.toFixed(1)} ${punkte[0].y.toFixed(1)} L ${endX.toFixed(1)} ${punkte[0].y.toFixed(1)}`;
    }

    const segmente = [`M ${punkte[0].x.toFixed(1)} ${punkte[0].y.toFixed(1)}`];

    for (let index = 1; index < punkte.length; index += 1) {
      const vorherigerPunkt = punkte[index - 1];
      const aktuellerPunkt = punkte[index];
      const mittelX = this.runden((vorherigerPunkt.x + aktuellerPunkt.x) / 2);
      segmente.push(`C ${mittelX.toFixed(1)} ${vorherigerPunkt.y.toFixed(1)}, ${mittelX.toFixed(1)} ${aktuellerPunkt.y.toFixed(1)}, ${aktuellerPunkt.x.toFixed(1)} ${aktuellerPunkt.y.toFixed(1)}`);
    }

    return segmente.join(' ');
  }

  /** Rundet SVG-Werte auf eine Nachkommastelle. */
  private runden(wert: number): number {
    return Math.round(wert * 10) / 10;
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



