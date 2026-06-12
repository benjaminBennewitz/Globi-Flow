/* src/app/features/patientenbericht/patientenbericht.component.ts */

/**
 * @file Rendert die Vorschau eines freigegebenen Patientenberichts.
 * @module PatientenberichtComponent
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Patientenbericht } from '../../core/models/patientenbericht.model';

/** Berichtsvorschau für Patientinnen und Patienten. */
@Component({
  selector: 'dd-patientenbericht',
  imports: [],
  templateUrl: './patientenbericht.component.html',
  styleUrl: './patientenbericht.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientenberichtComponent {
  /** Freigegebener Bericht aus Mockdaten oder später aus der API. */
  @Input({ required: true }) public bericht: Patientenbericht | null = null;
}
