/* src/app/features/wissens-editor/wissens-editor.component.ts */

/**
 * @file Rendert eine kompakte Vorschau der Wissensdatenbank.
 * @module WissensEditorComponent
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Wissenseintrag } from '../../core/models/wissenseintrag.model';

/** Editor-Vorschau für kontrollierte Wissenstexte. */
@Component({
  selector: 'dd-wissens-editor',
  imports: [],
  templateUrl: './wissens-editor.component.html',
  styleUrl: './wissens-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WissensEditorComponent {
  /** Wissenseinträge aus Mockdaten oder später aus der API. */
  @Input({ required: true }) public wissenseintraege: Wissenseintrag[] = [];
}
