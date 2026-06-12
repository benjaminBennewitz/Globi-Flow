/* src/app/pages/berichte-page/berichte-page.component.ts */

/**
 * @file Routenseite für Patientenberichte.
 * @module BerichtePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { PatientenberichtComponent } from '../../features/patientenbericht/patientenbericht.component';

/** Route `/berichte` für Berichtsvorschau und Printansicht. */
@Component({
  selector: 'dd-berichte-page',
  imports: [AsyncPipe, PatientenberichtComponent],
  templateUrl: './berichte-page.component.html',
  styleUrl: './berichte-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerichtePageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Patientenbericht aus Mockdaten oder später API. */
  protected readonly patientenbericht$ = this.datenDashboardApi.ladePatientenbericht();
}
