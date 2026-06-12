/* src/app/pages/importe-page/importe-page.component.ts */

/**
 * @file Routenseite für Importstatus und Upload.
 * @module ImportePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { ImportStatusComponent } from '../../features/import-status/import-status.component';

/** Route `/importe` für Importpipeline und neue Uploads. */
@Component({
  selector: 'dd-importe-page',
  imports: [AsyncPipe, ImportStatusComponent],
  templateUrl: './importe-page.component.html',
  styleUrl: './importe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportePageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Importjobs aus Mockdaten oder später API. */
  protected readonly importjobs$ = this.datenDashboardApi.ladeImportjobs();
}
