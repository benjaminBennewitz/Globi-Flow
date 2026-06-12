/* src/app/pages/analyse-page/analyse-page.component.ts */

/**
 * @file Routenseite für patientenbezogene Auswertung.
 * @module AnalysePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { AnalyseDashboardComponent } from '../../features/analyse-dashboard/analyse-dashboard.component';

/** Route `/auswertung` mit patientenbezogenem Analyse-Dashboard. */
@Component({
  selector: 'dd-analyse-page',
  imports: [AsyncPipe, AnalyseDashboardComponent],
  templateUrl: './analyse-page.component.html',
  styleUrl: './analyse-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysePageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Analyseansicht aus Mockdaten oder später API. */
  protected readonly ansicht$ = this.datenDashboardApi.ladeStartansicht();
}
