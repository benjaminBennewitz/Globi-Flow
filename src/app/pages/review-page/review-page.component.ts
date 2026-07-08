/* src/app/pages/review-page/review-page.component.ts */

/**
 * @file Routenseite für ärztliche Prüfung erkannter Laborwert-Kandidaten.
 * @module ReviewPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { ReviewCheckStatus, ReviewKandidat, ReviewKennzahl, ReviewStatus, ReviewViewModel } from '../../core/models/review.model';
import { PatientBefund } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { ToastService } from '../../shared/services/toast.service';

/** Filter der Review-Warteschlange. */
type ReviewFilter = ReviewStatus | 'alle';

/** Bearbeitbare numerische Felder eines Reviewkandidaten. */
type ReviewZahlFeld = 'korrigierterWert' | 'referenzMin' | 'referenzMax';

/** Bearbeitbare Textfelder eines Reviewkandidaten. */
type ReviewTextFeld = 'laborwertKey' | 'anzeigename' | 'korrigierteEinheit' | 'kommentar';

/** Route `/review` für ärztliche Qualitätssicherung. */
@Component({
  selector: 'gf-review-page',
  imports: [],
  templateUrl: './review-page.component.html',
  styleUrl: './review-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPageComponent {
  /** Globaler Patientenkontext. */
  public readonly patientContext = inject(PatientContextService);

  /** Toast-Service für Review-Aktionen. */
  private readonly toastService = inject(ToastService);

  /** API-Service für Reviewdaten. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Reviewzustand aus der API. */
  public readonly review: WritableSignal<ReviewViewModel> = signal({ kandidaten: [] });

  /** Aktiver Reviewkandidat. */
  public readonly aktiverKandidatId: WritableSignal<string> = signal('');

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

  /** Lädt Reviewdaten aus der API. */
  public constructor() {
    this.globiFlowApi.ladeReview().subscribe((review: ReviewViewModel) => {
      this.review.set(this.reviewKlonen(review));
      this.aktiverKandidatId.set(review.kandidaten[0]?.id ?? '');
    });
  }

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

  /** Gibt ein lesbares Statuslabel zurück. */
  public statusLabel(status: ReviewStatus): string {
    const labels: Record<ReviewStatus, string> = {
      offen: 'OFFEN',
      korrigiert: 'KORRIGIERT',
      bestaetigt: 'BESTÄTIGT',
      verworfen: 'VERWORFEN',
      blockiert: 'BLOCKIERT'
    };

    return labels[status];
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

  /** Aktualisiert ein Textfeld im lokalen Reviewzustand. */
  public textfeldSetzen(id: string, feld: ReviewTextFeld, event: Event): void {
    const eingabe = event.target as HTMLInputElement | HTMLTextAreaElement;
    const wert = eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '');
    this.kandidatAktualisieren(id, { [feld]: wert } as Partial<ReviewKandidat>);
  }

  /** Aktualisiert ein Zahlenfeld im lokalen Reviewzustand. */
  public zahlenfeldSetzen(id: string, feld: ReviewZahlFeld, event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const wert = Number(eingabe.value.replace(',', '.'));

    if (Number.isNaN(wert)) {
      return;
    }

    this.kandidatAktualisieren(id, { [feld]: wert } as Partial<ReviewKandidat>);
  }

  /** Stellt einen Kandidaten zurück. */
  public kandidatZurueckstellen(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'offen' }, 'Review zurückgestellt', `${kandidat.anzeigename} bleibt in der Warteschlange.`, 'warning');
  }

  /** Speichert die aktuelle Korrektur über die Backend-API. */
  public korrekturSpeichern(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'korrigiert' }, 'Korrektur gespeichert', `${kandidat.anzeigename} wurde in der Datenbank aktualisiert.`, 'success');
  }

  /** Speichert und springt erst nach erfolgreicher API-Antwort zum nächsten offenen Kandidaten. */
  public speichernUndWeiter(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'korrigiert' }, 'Korrektur gespeichert', `${kandidat.anzeigename} wurde in der Datenbank aktualisiert.`, 'success', () => {
      const naechster = this.naechsterOffenerKandidat(kandidat.id);

      if (naechster) {
        this.aktiverKandidatId.set(naechster.id);
        return;
      }

      this.toastService.zeige('Review-Kontext abgeschlossen', 'Es gibt keinen weiteren offenen Wert in diesem Befund.', 'success');
    });
  }

  /** Bestätigt alle sicheren Werte im aktiven Kontext. */
  public sichereWerteBestaetigen(): void {
    const ansicht = this.review();
    const kandidaten = this.kandidatenFuerKontext(ansicht).filter((kandidat: ReviewKandidat) => kandidat.confidence >= 85 && kandidat.status === 'offen');

    if (!kandidaten.length) {
      this.toastService.zeige('Keine sicheren Werte gefunden', 'Im aktuellen Kontext gibt es keine offenen Werte mit hoher Confidence.', 'info');
      return;
    }

    const ids = kandidaten.map((kandidat: ReviewKandidat) => kandidat.id);
    this.globiFlowApi.reviewKandidatenStatusSetzen(ids, 'bestaetigt').subscribe({
      next: (antwort: ReviewViewModel) => {
        this.review.update((wert: ReviewViewModel) => ({
          ...wert,
          kandidaten: wert.kandidaten.map((kandidat: ReviewKandidat) => antwort.kandidaten.find((eintrag: ReviewKandidat) => eintrag.id === kandidat.id) ?? kandidat)
        }));
        this.toastService.zeige('Sichere Werte bestätigt', `${kandidaten.length} Werte wurden in der Datenbank bestätigt.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Bestätigung fehlgeschlagen', 'Die Reviewwerte konnten nicht gespeichert werden.', 'danger');
      }
    });
  }

  /** Übernimmt alle geprüften Werte im aktiven Kontext für die nächste Workflowstufe. */
  public gepruefteUebernehmen(): void {
    const kandidaten = this.kandidatenFuerKontext(this.review()).filter((kandidat: ReviewKandidat) => kandidat.status === 'bestaetigt' || kandidat.status === 'korrigiert');
    const befund = this.patientContext.aktiverBefund();

    if (!kandidaten.length || !befund) {
      this.toastService.zeige('Keine geprüften Werte', 'Bitte zuerst Werte korrigieren oder bestätigen.', 'warning');
      return;
    }

    this.globiFlowApi.befundFreigeben(befund.id).subscribe({
      next: () => {
        this.patientContext.patientenNeuLaden();
        this.toastService.zeige('Befund freigegeben', `${kandidaten.length} geprüfte Werte sind bereit für Auswertung und Bericht.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Freigabe fehlgeschlagen', 'Der Befund konnte nicht freigegeben werden.', 'danger');
      }
    });
  }

  /** Setzt einen Reviewstatus lokal. */
  private statusSetzen(id: string, status: ReviewStatus): void {
    this.kandidatAktualisieren(id, { status });
  }

  /** Speichert einen Kandidaten optimistisch über die API. */
  private kandidatInApiSpeichern(kandidat: ReviewKandidat, titel: string, beschreibung: string, status: 'success' | 'warning', nachErfolg?: () => void): void {
    const vorherigerStand = this.review().kandidaten.find((eintrag: ReviewKandidat) => eintrag.id === kandidat.id);
    this.statusSetzen(kandidat.id, kandidat.status);
    this.globiFlowApi.reviewKandidatSpeichern(kandidat).subscribe({
      next: (antwort: ReviewKandidat) => {
        this.kandidatAktualisieren(antwort.id, antwort);
        this.toastService.zeige(titel, beschreibung, status);
        nachErfolg?.();
      },
      error: () => {
        if (vorherigerStand) {
          this.kandidatAktualisieren(vorherigerStand.id, vorherigerStand);
        }

        this.toastService.zeige('Speichern fehlgeschlagen', `${kandidat.anzeigename} konnte nicht in der Datenbank aktualisiert werden.`, 'danger');
      }
    });
  }

  /** Aktualisiert einen Kandidaten im lokalen Zustand. */
  private kandidatAktualisieren(id: string, patch: Partial<ReviewKandidat>): void {
    this.review.update((ansicht: ReviewViewModel) => ({
      ...ansicht,
      kandidaten: ansicht.kandidaten.map((kandidat: ReviewKandidat) => kandidat.id === id ? { ...kandidat, ...patch } : kandidat)
    }));
  }

  /** Liefert den nächsten offenen Kandidaten im aktiven Kontext. */
  private naechsterOffenerKandidat(aktuellerId: string): ReviewKandidat | null {
    return this.kandidatenFuerKontext(this.review()).filter((kandidat: ReviewKandidat) => kandidat.id !== aktuellerId && (kandidat.status === 'offen' || kandidat.status === 'blockiert')).sort((a: ReviewKandidat, b: ReviewKandidat) => this.sortierwert(b) - this.sortierwert(a))[0] ?? null;
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

  /** Erstellt einen tiefen Klon der Review-Mockdaten. */
  private reviewKlonen(ansicht: ReviewViewModel): ReviewViewModel {
    return {
      kandidaten: ansicht.kandidaten.map((kandidat: ReviewKandidat) => ({
        ...kandidat,
        parserHinweise: [...kandidat.parserHinweise],
        checks: kandidat.checks.map((check) => ({ ...check }))
      }))
    };
  }
}
