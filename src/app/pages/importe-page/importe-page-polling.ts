/* src/app/pages/importe-page/importe-page-polling.ts */

/**
 * @file Gekapselte Polling-Steuerung für laufende Importjobs.
 * @module ImportPollingController
 */

import { Importjob } from '../../core/models/importjob.model';
import { importLaeuft } from './importe-page-logik';

/** Verwaltet genau ein Aktualisierungsintervall für aktive Importjobs. */
export class ImportPollingController {
  private poller: number | null = null;  // Aktuell registriertes Browserintervall.

  /**
   * Erstellt die Polling-Steuerung mit einer Aktualisierungsfunktion.
   *
   * @param aktualisieren Callback zum erneuten Laden der Importjobs.
   */
  public constructor(private readonly aktualisieren: () => void) { }

  /** Startet das Polling, sofern noch kein Intervall aktiv ist. */
  public starten(): void {
    if (this.poller !== null) {
      return;
    }

    this.poller = window.setInterval(this.aktualisieren, 2500);
  }

  /** Stoppt das aktive Polling und gibt die Intervallreferenz frei. */
  public stoppen(): void {
    if (this.poller === null) {
      return;
    }

    window.clearInterval(this.poller);
    this.poller = null;
  }

  /**
   * Aktiviert oder stoppt das Polling anhand der aktuellen Jobzustände.
   *
   * @param jobs Aktuell geladene Importjobs.
   */
  public nachStatusAktualisieren(jobs: Importjob[]): void {
    if (jobs.some((job) => importLaeuft(job))) {
      this.starten();
      return;
    }

    this.stoppen();
  }
}
