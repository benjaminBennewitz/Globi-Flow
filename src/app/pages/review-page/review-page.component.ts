/* src/app/pages/review-page/review-page.component.ts */

/**
 * @file Routenseite für ärztliche Review.
 * @module ReviewPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { ReviewQueueComponent } from '../../features/review-queue/review-queue.component';

/** Route `/review` für unsichere Werte und Korrekturworkflow. */
@Component({
  selector: 'dd-review-page',
  imports: [AsyncPipe, ReviewQueueComponent],
  templateUrl: './review-page.component.html',
  styleUrl: './review-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Review-Einträge aus Mockdaten oder später API. */
  protected readonly reviewEintraege$ = this.datenDashboardApi.ladeReviewEintraege();
}
