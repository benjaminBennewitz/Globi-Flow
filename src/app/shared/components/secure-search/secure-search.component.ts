/* src/app/shared/components/secure-search/secure-search.component.ts */

/**
 * @file Wiederverwendbares Suchfeld mit zentraler Sicherheitsnormalisierung.
 * @module SecureSearchComponent
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, WritableSignal, signal } from '@angular/core';
import { normalisiereSichereSuche } from '../../../core/security/sichere-suche.util';

/** Einheitliches Suchfeld für sichere lokale und spätere API-Suchen. */
@Component({
  selector: 'dd-secure-search',
  imports: [],
  templateUrl: './secure-search.component.html',
  styleUrl: './secure-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecureSearchComponent {
  /** Aktueller Suchwert. */
  @Input() public value = '';

  /** Placeholder des Suchfelds. */
  @Input() public placeholder = 'Suchen';

  /** Zugängliches Label für das Suchfeld. */
  @Input() public label = 'Suche';

  /** Emitiert den normalisierten Suchwert. */
  @Output() public readonly valueChange = new EventEmitter<string>();

  /** Rückmeldung bei entschärfter Eingabe. */
  public readonly feedback: WritableSignal<string> = signal('');

  /** Verarbeitet Eingaben mit zentraler Normalisierung. */
  public sucheAendern(event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const ergebnis = normalisiereSichereSuche(eingabe.value);

    this.feedback.set(ergebnis.meldung);
    this.value = ergebnis.wert;
    eingabe.value = ergebnis.wert;
    this.valueChange.emit(ergebnis.wert);
  }
}
