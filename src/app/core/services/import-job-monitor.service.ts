/* src/app/core/services/import-job-monitor.service.ts */

/**
 * @file Beobachtet laufende Importjobs routeunabhängig.
 * @module ImportJobMonitorService
 */

import { Injectable, OnDestroy, inject } from '@angular/core';
import { Importjob, ImportjobStatus } from '../models/importjob.model';
import { ToastService } from '../../shared/services/toast.service';
import { GlobiFlowApiService } from './globi-flow-api.service';
import { PatientContextService } from './patient-context.service';

/** Statuswerte, bei denen ein Import nicht mehr aktiv läuft. */
const ABSCHLUSS_STATUS = new Set<ImportjobStatus>(['abgeschlossen', 'review', 'fehler']);

/** Statuswerte, bei denen ein Import aktiv beobachtet werden soll. */
const AKTIVE_STATUS = new Set<ImportjobStatus>(['wartet', 'analysiert']);

/** Routeunabhängiger Monitor für lokale Importjobs. */
@Injectable({ providedIn: 'root' })
export class ImportJobMonitorService implements OnDestroy {
  /** API-Service für Importstatus. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Toast-Service für Abschlussmeldungen. */
  private readonly toastService = inject(ToastService);

  /** Patientenkontext wird nach fertigem Import neu geladen. */
  private readonly patientContext = inject(PatientContextService);

  /** Beobachtete Job-IDs mit zuletzt bekanntem Status. */
  private readonly beobachteteJobs = new Map<string, ImportjobStatus>();

  /** Polling-Handle für laufende Importbeobachtung. */
  private poller: number | null = null;

  /** Registriert einen Importjob für routeunabhängige Abschlussmeldungen. */
  public importJobBeobachten(job: Importjob): void {
    if (!job.id || ABSCHLUSS_STATUS.has(job.status)) {
      return;
    }

    this.beobachteteJobs.set(job.id, job.status);
    this.pollingStarten();
  }

  /** Stoppt offene Polling-Prozesse beim Service-Abbau. */
  public ngOnDestroy(): void {
    this.pollingStoppen();
  }

  /** Startet das Polling, sofern es noch nicht läuft. */
  private pollingStarten(): void {
    if (this.poller !== null) {
      return;
    }

    this.poller = window.setInterval(() => this.importjobsPruefen(), 4500);
    this.importjobsPruefen();
  }

  /** Stoppt das Polling, wenn keine Jobs mehr beobachtet werden. */
  private pollingStoppen(): void {
    if (this.poller === null) {
      return;
    }

    window.clearInterval(this.poller);
    this.poller = null;
  }

  /** Lädt Jobs und meldet abgeschlossene Importläufe. */
  private importjobsPruefen(): void {
    if (!this.beobachteteJobs.size) {
      this.pollingStoppen();
      return;
    }

    this.globiFlowApi.ladeImportjobs().subscribe({
      next: (jobs: Importjob[]) => this.importjobsAuswerten(jobs),
      error: () => undefined
    });
  }

  /** Prüft Statuswechsel und erzeugt bei Abschluss passende Toaster. */
  private importjobsAuswerten(jobs: Importjob[]): void {
    for (const [jobId, vorherigerStatus] of Array.from(this.beobachteteJobs.entries())) {
      const job = jobs.find((eintrag: Importjob) => eintrag.id === jobId);

      if (!job) {
        this.beobachteteJobs.delete(jobId);
        continue;
      }

      if (AKTIVE_STATUS.has(job.status)) {
        this.beobachteteJobs.set(jobId, job.status);
        continue;
      }

      if (ABSCHLUSS_STATUS.has(job.status) && vorherigerStatus !== job.status) {
        this.abschlussMelden(job);
      }

      this.beobachteteJobs.delete(jobId);
    }

    if (!this.beobachteteJobs.size) {
      this.pollingStoppen();
    }
  }

  /** Zeigt einen passenden Abschluss-Toast und aktualisiert Patientendaten. */
  private abschlussMelden(job: Importjob): void {
    (this.patientContext as unknown as { patientenNeuLaden?: () => void }).patientenNeuLaden?.();

    if (job.status === 'review') {
      this.toastService.zeige('Import benötigt Review', `${job.dateiname}: ${job.unsichereWerte} Werte prüfen.`, 'warning');
      return;
    }

    if (job.status === 'fehler') {
      this.toastService.zeige('Import fehlgeschlagen', job.fehlermeldung || `${job.dateiname} konnte nicht verarbeitet werden.`, 'danger');
      return;
    }

    this.toastService.zeige('Import abgeschlossen', `${job.dateiname}: ${job.erkannteWerte} Werte übernommen.`, 'success');
  }
}
