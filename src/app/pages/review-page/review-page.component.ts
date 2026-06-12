/* src/app/pages/review-page/review-page.component.ts */

/**
 * @file Routenseite für ärztliche Prüfung erkannter Laborwert-Kandidaten.
 * @module ReviewPageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { ReviewCheckStatus, ReviewKandidat, ReviewKennzahl, ReviewStatus, ReviewViewModel } from '../../core/models/review.model';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';
import { PatientBefund } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';

/** Filter der Review-Warteschlange. */
type ReviewFilter = ReviewStatus | 'alle';

/** Route `/review` für ärztliche Qualitätssicherung. */
@Component({
  selector: 'dd-review-page',
  imports: [AsyncPipe],
  templateUrl: './review-page.component.html',
  styleUrl: './review-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Globaler Patientenkontext. */
  public readonly patientContext = inject(PatientContextService);

  /** Reviewdaten aus Mockdaten oder später API. */
  protected readonly review$ = this.datenDashboardApi.ladeReview();

  /** Aktiver Reviewkandidat. */
  public readonly aktiverKandidatId: WritableSignal<string> = signal('review-ldl');

  /** Aktiver Statusfilter. */
  public readonly aktiverFilter: WritableSignal<ReviewFilter> = signal('alle');

  /** Zoomfaktor des Originalausschnitts. */
  public readonly originalZoom: WritableSignal<number> = signal(1);

  /** Statusfilter für die Warteschlange. */
  public readonly filterOptionen: { key: ReviewFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'offen', label: 'Offen' },
    { key: 'korrigiert', label: 'Korrigiert' },
    { key: 'bestaetigt', label: 'Bestätigt' },
    { key: 'blockiert', label: 'Blockiert' }
  ];

  /** Liefert Reviewkennzahlen. */
  public kennzahlen(ansicht: ReviewViewModel): ReviewKennzahl[] {
    const kandidaten = this.kandidatenFuerKontext(ansicht);

    return [
      { label: 'Offen', wert: this.statusAnzahl(kandidaten, 'offen'), hinweis: 'zu prüfen', icon: 'pending_actions', status: 'warning' },
      { label: 'Unsicher', wert: kandidaten.filter((kandidat: ReviewKandidat) => kandidat.confidence < 75).length, hinweis: 'Confidence < 75 %', icon: 'priority_high', status: 'danger' },
      { label: 'Korrigiert', wert: this.statusAnzahl(kandidaten, 'korrigiert'), hinweis: 'gespeichert', icon: 'edit_note', status: 'info' },
      { label: 'Bestätigt', wert: this.statusAnzahl(kandidaten, 'bestaetigt'), hinweis: 'bereit zur Übernahme', icon: 'verified', status: 'success' },
      { label: 'Blockierend', wert: this.statusAnzahl(kandidaten, 'blockiert'), hinweis: 'Konflikt prüfen', icon: 'block', status: 'danger' }
    ];
  }

  /** Liefert gefilterte Kandidaten der Warteschlange. */
  public sichtbareKandidaten(ansicht: ReviewViewModel): ReviewKandidat[] {
    return this.kandidatenFuerKontext(ansicht).filter((kandidat: ReviewKandidat) => this.aktiverFilter() === 'alle' || kandidat.status === this.aktiverFilter()).sort((a: ReviewKandidat, b: ReviewKandidat) => this.sortierwert(b) - this.sortierwert(a));
  }

  /** Liefert den aktiven Reviewkandidaten. */
  public aktiverKandidat(ansicht: ReviewViewModel): ReviewKandidat | null {
    const sichtbare = this.sichtbareKandidaten(ansicht);
    return sichtbare.find((kandidat: ReviewKandidat) => kandidat.id === this.aktiverKandidatId()) ?? sichtbare[0] ?? this.kandidatenFuerKontext(ansicht)[0] ?? null;
  }

  /** Setzt den aktiven Befund. */
  public befundSetzen(befund: PatientBefund): void {
    this.patientContext.befundSetzen(befund);
    this.aktiverKandidatId.set('');
  }

  /** Setzt den aktiven Filter. */
  public filterSetzen(filter: ReviewFilter): void {
    this.aktiverFilter.set(filter);
  }

  /** Setzt den aktiven Kandidaten. */
  public kandidatSetzen(kandidat: ReviewKandidat): void {
    this.aktiverKandidatId.set(kandidat.id);
  }

  /** Reduziert den Originalzoom. */
  public zoomRaus(): void {
    this.originalZoom.update((wert: number) => Math.max(0.86, Math.round((wert - 0.08) * 100) / 100));
  }

  /** Erhöht den Originalzoom. */
  public zoomRein(): void {
    this.originalZoom.update((wert: number) => Math.min(1.18, Math.round((wert + 0.08) * 100) / 100));
  }

  /** Gibt Statusklasse zurück. */
  public statusKlasse(status: ReviewStatus | ReviewCheckStatus): string {
    return `is-${status}`;
  }

  /** Gibt Quellenlabel zurück. */
  public quelleLabel(kandidat: ReviewKandidat): string {
    const labels = {
      pdf_text: 'PDF-Text',
      ocr: 'OCR',
      manuell: 'Manuell',
      demo: 'Demo'
    };

    return labels[kandidat.quelle];
  }

  /** Formatiert Korrekturwert und Einheit. */
  public korrigierterMesswert(kandidat: ReviewKandidat): string {
    return `${this.zahl(kandidat.korrigierterWert)} ${kandidat.korrigierteEinheit}`;
  }

  /** Berechnet Fortschritt für den Reviewabschluss. */
  public fortschritt(ansicht: ReviewViewModel): number {
    const kandidaten = this.kandidatenFuerKontext(ansicht);
    const abgeschlossen = kandidaten.filter((kandidat: ReviewKandidat) => kandidat.status === 'bestaetigt' || kandidat.status === 'korrigiert' || kandidat.status === 'verworfen').length;
    return Math.round((abgeschlossen / Math.max(kandidaten.length, 1)) * 100);
  }

  /** Liefert Kandidaten des aktiven Patienten und Befunds. */
  private kandidatenFuerKontext(ansicht: ReviewViewModel): ReviewKandidat[] {
    return ansicht.kandidaten.filter((kandidat: ReviewKandidat) => kandidat.patientId === this.patientContext.aktiverPatient().id && kandidat.befundId === this.patientContext.aktiverBefund()?.id);
  }

  /** Zählt Statusvorkommen. */
  private statusAnzahl(kandidaten: ReviewKandidat[], status: ReviewStatus): number {
    return kandidaten.filter((kandidat: ReviewKandidat) => kandidat.status === status).length;
  }

  /** Sortiert nach Reviewdringlichkeit. */
  private sortierwert(kandidat: ReviewKandidat): number {
    const status = kandidat.status === 'offen' ? 80 : kandidat.status === 'blockiert' ? 70 : 0;
    const confidence = 100 - kandidat.confidence;
    const quelle = kandidat.quelle === 'ocr' ? 35 : 0;
    return status + confidence + quelle;
  }

  /** Formatiert Zahlen deutsch. */
  private zahl(wert: number): string {
    return Number.isInteger(wert) ? `${wert}` : wert.toFixed(1).replace('.', ',');
  }
}

