/* src/app/features/import-status/import-status.component.ts */

/**
 * @file Rendert Upload- und Importstatus mit Pipeline-Schritten.
 * @module ImportStatusComponent
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Importjob, ImportjobStatus } from '../../core/models/importjob.model';

/** Importbereich mit API-bereitem Status-Layout. */
@Component({
  selector: 'dd-import-status',
  imports: [],
  templateUrl: './import-status.component.html',
  styleUrl: './import-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportStatusComponent {
  /** Liste der aktuellen Importjobs. */
  @Input({ required: true }) public importjobs: Importjob[] = [];

  /** Gibt die Badge-Klasse für einen Importstatus zurück. */
  public statusKlasse(status: ImportjobStatus): string {
    return `dd-chip--${status === 'abgeschlossen' ? 'success' : status === 'fehler' ? 'danger' : 'warning'}`;
  }
}
