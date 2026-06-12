/* src/app/pages/wissensbasis-page/wissensbasis-page.component.ts */

/**
 * @file Routenseite für Wissensbasis.
 * @module WissensbasisPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { WissensEditorComponent } from '../../features/wissens-editor/wissens-editor.component';

/** Route `/wissensbasis` für kontrollierte Erklärungstexte. */
@Component({
  selector: 'dd-wissensbasis-page',
  imports: [AsyncPipe, WissensEditorComponent],
  templateUrl: './wissensbasis-page.component.html',
  styleUrl: './wissensbasis-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WissensbasisPageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Wissenseinträge aus Mockdaten oder später API. */
  protected readonly wissenseintraege$ = this.datenDashboardApi.ladeWissenseintraege();
}
