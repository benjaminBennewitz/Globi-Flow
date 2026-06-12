/* src/app/features/review-queue/review-queue.component.ts */

/**
 * @file Rendert die ärztliche Review-Oberfläche.
 * @module ReviewQueueComponent
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReviewEintrag } from '../../core/models/review-eintrag.model';

/** Review-Komponente für unsichere Importwerte. */
@Component({
  selector: 'dd-review-queue',
  imports: [],
  templateUrl: './review-queue.component.html',
  styleUrl: './review-queue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewQueueComponent {
  /** Liste der offenen Review-Einträge. */
  @Input({ required: true }) public reviewEintraege: ReviewEintrag[] = [];
}
