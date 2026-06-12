/* src/app/features/analyse-dashboard/analyse-dashboard.component.ts */

/**
 * @file Rendert das Analyse-Dashboard mit animierten Datenvisualisierungen.
 * @module AnalyseDashboardComponent
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DashboardTrend, Laborwert, LaborwertGruppe, LaborwertStatus } from '../../core/models/laborwert.model';

/** Dashboard-Komponente mit Fokus auf Werte, Graphen und Trends. */
@Component({
  selector: 'dd-analyse-dashboard',
  imports: [],
  templateUrl: './analyse-dashboard.component.html',
  styleUrl: './analyse-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyseDashboardComponent {
  /** Normalisierte Laborwerte für Tabellen und Karten. */
  @Input({ required: true }) public laborwerte: Laborwert[] = [];

  /** Gruppierte Laborwerte für Balkengrafiken. */
  @Input({ required: true }) public gruppen: LaborwertGruppe[] = [];

  /** Trendserien für große SVG-Grafiken. */
  @Input({ required: true }) public trends: DashboardTrend[] = [];

  /** Steuert, ob Datensätze vollständig ausgeklappt sind. */
  public alleDatensaetzeSichtbar = false;

  /** Gibt den ersten Laborwert als aktiven Fokuswert zurück. */
  public get aktiverLaborwert(): Laborwert | null {
    return this.laborwerte[1] ?? this.laborwerte[0] ?? null;
  }

  /** Schaltet alle Datensatzkarten global ein oder aus. */
  public datensaetzeUmschalten(): void {
    this.alleDatensaetzeSichtbar = !this.alleDatensaetzeSichtbar;
  }

  /** Gibt eine Statusklasse für Laborwerte zurück. */
  public statusKlasse(status: LaborwertStatus): string {
    return `is-${status}`;
  }

  /** Berechnet die Balkenhöhe aus Gruppenwerten. */
  public gruppenHoehe(gruppe: LaborwertGruppe): string {
    const gesamt = Math.max(gruppe.normal + gruppe.auffaellig + gruppe.review, 1);
    const anteil = Math.round(((gruppe.auffaellig + gruppe.review) / gesamt) * 100);
    return `${Math.max(16, anteil)}%`;
  }

  /** Berechnet die Position eines Laborwerts im Referenzbereich. */
  public wertPosition(laborwert: Laborwert): string {
    const min = laborwert.referenzMin;
    const max = laborwert.referenzMax;
    const span = Math.max(max - min, 1);
    const relativ = ((laborwert.wert - min) / span) * 100;
    const begrenzt = Math.min(100, Math.max(0, relativ));
    return `${begrenzt}%`;
  }

  /** Wandelt Trendwerte in SVG-Punkte um. */
  public punkteFuerTrend(werte: number[]): string {
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    const span = Math.max(max - min, 1);
    const maxIndex = Math.max(werte.length - 1, 1);
    return werte.map((wert: number, index: number) => {
      const x = 16 + (index / maxIndex) * 268;
      const y = 128 - ((wert - min) / span) * 96;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
