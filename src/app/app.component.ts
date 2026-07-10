/* src/app/app.component.ts */

/**
 * @file Root-Komponente für Globi Flow.
 * @module AppComponent
 */

import { ChangeDetectionStrategy, Component, OnDestroy, WritableSignal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavigationComponent } from './shared/components/app-navigation/app-navigation.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

/** Root-Komponente der Anwendung mit Shell, RouterOutlet, Startanimation und globalen Toasts. */
@Component({
  selector: 'gf-root',
  imports: [RouterOutlet, AppNavigationComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  public readonly startanimationSichtbar: WritableSignal<boolean> = signal(true);    // Gibt an, ob die Startanimation noch im DOM sichtbar ist.
  public readonly startanimationSchliesst: WritableSignal<boolean> = signal(false);  // Steuert den finalen Slide nach oben.
  public readonly startFortschritt: WritableSignal<number> = signal(0);              // Fortschritt der Startanimation in Prozent.
  private readonly startDauerMs = 3000;                                              // Gesamtdauer bis zum vollständigen Fortschritt.
  private readonly abgangDauerMs = 620;                                              // Dauer des ausgehenden Slide-Reveals.
  private animationsFrameId = 0;                                                     // Aktive Animation-Frame-ID für den Fortschritt.
  private abgangTimerId: ReturnType<typeof setTimeout> | null = null;                // Timer für das Entfernen des Overlays nach dem Abgang.
  private startZeitMs = 0;                                                           // Startzeit der Fortschrittsberechnung.


  /** Startet die Intro-Sequenz direkt beim App-Initialisieren. */
  public constructor() {
    this.startanimationStarten();
  }

  /** Räumt laufende Timer und Frames beim Entfernen der Root-Komponente auf. */
  public ngOnDestroy(): void {
    if (this.animationsFrameId) {
      cancelAnimationFrame(this.animationsFrameId);
    }

    if (this.abgangTimerId) {
      clearTimeout(this.abgangTimerId);
    }
  }

  /** Animiert den Fortschritt über drei Sekunden und startet danach den Reveal-Abgang. */
  private startanimationStarten(): void {
    if (typeof requestAnimationFrame === 'undefined') {
      this.startFortschritt.set(100);
      this.startanimationSchliesst.set(true);
      this.abgangTimerId = setTimeout(() => this.startanimationSichtbar.set(false), this.abgangDauerMs);
      return;
    }

    this.startZeitMs = performance.now();

    const fortschrittAktualisieren = (zeitMs: number): void => {
      const vergangenMs = Math.max(0, zeitMs - this.startZeitMs); // Vergangene Zeit der Introanimation.
      const prozent = Math.min(100, Math.round((vergangenMs / this.startDauerMs) * 100)); // Sichtbarer Fortschritt.

      this.startFortschritt.set(prozent);

      if (prozent >= 100) {
        this.startanimationSchliesst.set(true);
        this.abgangTimerId = setTimeout(() => this.startanimationSichtbar.set(false), this.abgangDauerMs);
        return;
      }

      this.animationsFrameId = requestAnimationFrame(fortschrittAktualisieren);
    };

    this.animationsFrameId = requestAnimationFrame(fortschrittAktualisieren);
  }
}
