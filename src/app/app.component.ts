/* src/app/app.component.ts */

/**
 * @file Root-Komponente für den Frontend-Prototyp.
 * @module AppComponent
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root-Komponente der Anwendung. */
@Component({
  selector: 'dd-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  /** Anzeigename der Anwendung. */
  protected readonly appName = 'Daten Dashboards';

  /** Kurzer Claim für den Startscreen. */
  protected readonly claim = 'Local Lab Insight Hub';
}
