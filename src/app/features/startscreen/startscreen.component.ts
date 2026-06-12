/* src/app/features/startscreen/startscreen.component.ts */

/**
 * @file Rendert die Startseite als arztzentriertes Datenauswertungs-Dashboard.
 * @module StartscreenComponent
 */

import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DashboardKennzahlen } from '../../core/models/dashboard-view.model';
import { DashboardTrend, Laborwert, LaborwertGruppe, LaborwertStatus } from '../../core/models/laborwert.model';

/** Startscreen im Stil der finalen Datenauswertungs-Screens. */
@Component({
  selector: 'dd-startscreen',
  imports: [DecimalPipe],
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartscreenComponent {
  /** Kennzahlen für die oberen KPI-Karten. */
  @Input({ required: true }) public kennzahlen: DashboardKennzahlen = {
    befunde: 0,
    laborwerte: 0,
    review: 0,
    berichte: 0,
    confidence: 0
  };

  /** Normalisierte Laborwerte für Tabellen, Diagramme und Insights. */
  @Input({ required: true }) public laborwerte: Laborwert[] = [];

  /** Gruppierte Laborwerte für Bereichsfilter. */
  @Input({ required: true }) public gruppen: LaborwertGruppe[] = [];

  /** Trenddaten für spätere API-Anbindung. */
  @Input({ required: true }) public trends: DashboardTrend[] = [];

  /** Gibt die auffälligen Werte für Tabelle und Insights zurück. */
  public get auffaelligeWerte(): Laborwert[] {
    return this.laborwerte.filter((wert: Laborwert) => wert.status === 'hoch' || wert.status === 'niedrig');
  }

  /** Gibt die Werte in Review zurück. */
  public get reviewWerte(): Laborwert[] {
    return this.laborwerte.filter((wert: Laborwert) => wert.status === 'review');
  }

  /** Gibt die Anzahl der geprüften Werte zurück. */
  public get gepruefteWerte(): number {
    return Math.max(this.kennzahlen.laborwerte - this.reviewWerte.length, 0);
  }

  /** Gibt den aktiven Fokuswert für die große Verlaufsgrafik zurück. */
  public get fokuswert(): Laborwert | null {
    return this.laborwerte.find((wert: Laborwert) => wert.key === 'haemoglobin') ?? this.laborwerte[0] ?? null;
  }

  /** Erzeugt die Donut-Verteilung als CSS-Gradient. */
  public get verteilungGradient(): string {
    const normal = Math.max(this.kennzahlen.laborwerte - this.auffaelligeWerte.length - this.reviewWerte.length, 0);
    const auffaellig = this.auffaelligeWerte.length;
    const review = this.reviewWerte.length;
    const gesamt = Math.max(normal + auffaellig + review, 1);
    const normalGrad = (normal / gesamt) * 360;
    const auffaelligGrad = normalGrad + (auffaellig / gesamt) * 360;
    return `conic-gradient(var(--dd-status-normal) 0deg ${normalGrad}deg, var(--dd-status-high) ${normalGrad}deg ${auffaelligGrad}deg, var(--dd-status-review) ${auffaelligGrad}deg 360deg)`;
  }

  /** Gibt eine Statusklasse für Laborwerte zurück. */
  public statusKlasse(status: LaborwertStatus): string {
    return `is-${status}`;
  }

  /** Wandelt Trendwerte in SVG-Punkte um. */
  public punkteFuerTrend(werte: number[]): string {
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    const span = Math.max(max - min, 1);
    const maxIndex = Math.max(werte.length - 1, 1);
    return werte.map((wert: number, index: number) => {
      const x = 18 + (index / maxIndex) * 492;
      const y = 178 - ((wert - min) / span) * 118;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  /** Gibt die Richtung des Trends für eine Tabellenanzeige zurück. */
  public trendRichtung(wert: Laborwert): string {
    const ersterWert = wert.trend[0] ?? wert.wert;
    const letzterWert = wert.trend[wert.trend.length - 1] ?? wert.wert;
    return letzterWert >= ersterWert ? 'trending_up' : 'trending_down';
  }
}
