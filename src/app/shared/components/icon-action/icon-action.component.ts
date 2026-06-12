/* src/app/shared/components/icon-action/icon-action.component.ts */

/**
 * @file Einheitlicher Icon-Button für Schließen, Löschen und kompakte Aktionen.
 * @module IconActionComponent
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/** Wiederverwendbarer Icon-Aktionsbutton mit einheitlichem Hover-Verhalten. */
@Component({
  selector: 'dd-icon-action',
  imports: [],
  templateUrl: './icon-action.component.html',
  styleUrl: './icon-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconActionComponent {
  /** Material-Symbol. */
  @Input() public icon = 'close';

  /** Aria-Label und Tooltip-Text. */
  @Input() public label = 'Schließen';

  /** Optischer Ton des Buttons. */
  @Input() public tone: 'danger' | 'primary' | 'muted' | 'success' | 'warning' = 'danger';

  /** Klickereignis der Aktion. */
  @Output() public readonly action = new EventEmitter<void>();

  /** Emitiert die Aktion. */
  public ausloesen(): void {
    this.action.emit();
  }
}
