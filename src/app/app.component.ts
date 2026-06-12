/* src/app/app.component.ts */

/**
 * @file Root-Komponente für Daten Dashboards.
 * @module AppComponent
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavigationComponent } from './shared/components/app-navigation/app-navigation.component';

/** Root-Komponente der Anwendung mit Shell und RouterOutlet. */
@Component({
  selector: 'dd-root',
  imports: [RouterOutlet, AppNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}
