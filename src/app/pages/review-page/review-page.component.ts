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
import { bereinigeSichereEingabe } from '../../core/security/sichere-eingabe.util';
import { ReviewFilter, aktiverReviewKandidat, kandidatenFuerReviewKontext, kloneReviewAnsicht, korrigierterReviewMesswert, naechsterOffenerReviewKandidat, reviewFortschritt, reviewKennzahlen, reviewQuelleLabel, reviewStatusKlasse, reviewStatusLabel, sichtbareReviewKandidaten } from './review-page-logik';

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
  public readonly patientContext = inject(PatientContextService);                        // Globaler Patientenkontext.
  private readonly toastService = inject(ToastService);                                  // Toast-Service für Review-Aktionen.
  private readonly globiFlowApi = inject(GlobiFlowApiService);                           // API-Service für Reviewdaten.
  public readonly review: WritableSignal<ReviewViewModel> = signal({ kandidaten: [] });  // Reviewzustand aus der API.
  public readonly aktiverKandidatId: WritableSignal<string> = signal('');                // Aktiver Reviewkandidat.
  public readonly aktiverFilter: WritableSignal<ReviewFilter> = signal('alle');          // Aktiver Statusfilter.
  public readonly originalZoom: WritableSignal<number> = signal(1);                      // Zoomfaktor des Originalausschnitts.

  /** Statusfilter für die Warteschlange. */
  public readonly filterOptionen: { key: ReviewFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'offen', label: 'Offen' },
    { key: 'korrigiert', label: 'Korrigiert' },
    { key: 'bestaetigt', label: 'Bestätigt' },
    { key: 'blockiert', label: 'Blockiert' }
  ];

  /** Lädt Reviewdaten aus der API und aktiviert den ersten Kandidaten. */
  public constructor() {
    this.globiFlowApi.ladeReview().subscribe((review: ReviewViewModel) => {
      this.review.set(kloneReviewAnsicht(review));
      this.aktiverKandidatId.set(review.kandidaten[0]?.id ?? '');
    });
  }

  /**
   * Liefert Reviewkennzahlen für den aktiven Patienten- und Befundkontext.
   *
   * @param ansicht Vollständiger Reviewzustand.
   * @returns Kennzahlenkarten des aktiven Arbeitskontexts.
   */
  public kennzahlen(ansicht: ReviewViewModel): ReviewKennzahl[] {
    return reviewKennzahlen(this.kandidatenFuerKontext(ansicht));
  }

  /**
   * Liefert gefilterte und nach Dringlichkeit sortierte Kandidaten.
   *
   * @param ansicht Vollständiger Reviewzustand.
   * @returns Sichtbare Kandidaten der Warteschlange.
   */
  public sichtbareKandidaten(ansicht: ReviewViewModel): ReviewKandidat[] {
    return sichtbareReviewKandidaten(this.kandidatenFuerKontext(ansicht), this.aktiverFilter());
  }

  /**
   * Ermittelt den aktiven Reviewkandidaten.
   *
   * @param ansicht Vollständiger Reviewzustand.
   * @returns Aktiver Kandidat oder `null`.
   */
  public aktiverKandidat(ansicht: ReviewViewModel): ReviewKandidat | null {
    const kandidaten: ReviewKandidat[] = this.kandidatenFuerKontext(ansicht); // Kandidaten des aktiven Kontexts.
    const sichtbare: ReviewKandidat[] = sichtbareReviewKandidaten(kandidaten, this.aktiverFilter()); // Gefilterte Kandidaten.

    return aktiverReviewKandidat(sichtbare, kandidaten, this.aktiverKandidatId());
  }

  /**
   * Setzt den aktiven Befund und verwirft die bisherige Kandidatenauswahl.
   *
   * @param befund Neuer aktiver Befund.
   */
  public befundSetzen(befund: PatientBefund): void {
    this.patientContext.befundSetzen(befund);
    this.aktiverKandidatId.set('');
  }

  /**
   * Setzt den aktiven Statusfilter.
   *
   * @param filter Ausgewählter Reviewfilter.
   */
  public filterSetzen(filter: ReviewFilter): void {
    this.aktiverFilter.set(filter);
  }

  /**
   * Aktiviert einen Reviewkandidaten.
   *
   * @param kandidat Ausgewählter Kandidat.
   */
  public kandidatSetzen(kandidat: ReviewKandidat): void {
    this.aktiverKandidatId.set(kandidat.id);
  }

  /** Reduziert den Zoom des Originalausschnitts bis zum Minimalwert. */
  public zoomRaus(): void {
    this.originalZoom.update((wert: number) => Math.max(0.86, Math.round((wert - 0.08) * 100) / 100));
  }

  /** Erhöht den Zoom des Originalausschnitts bis zum Maximalwert. */
  public zoomRein(): void {
    this.originalZoom.update((wert: number) => Math.min(1.18, Math.round((wert + 0.08) * 100) / 100));
  }

  /**
   * Gibt die CSS-Klasse eines Review- oder Checkstatus zurück.
   *
   * @param status Fachlicher Status.
   * @returns CSS-Klasse im Format `is-<status>`.
   */
  public statusKlasse(status: ReviewStatus | ReviewCheckStatus): string {
    return reviewStatusKlasse(status);
  }

  /**
   * Gibt die lesbare Bezeichnung eines Reviewstatus zurück.
   *
   * @param status Status des Reviewkandidaten.
   * @returns Statusbezeichnung in Versalien.
   */
  public statusLabel(status: ReviewStatus): string {
    return reviewStatusLabel(status);
  }

  /**
   * Gibt die lesbare Bezeichnung der Extraktionsquelle zurück.
   *
   * @param kandidat Reviewkandidat mit Quellenangabe.
   * @returns Lesbares Quellenlabel.
   */
  public quelleLabel(kandidat: ReviewKandidat): string {
    return reviewQuelleLabel(kandidat);
  }

  /**
   * Formatiert den korrigierten Messwert mit Einheit.
   *
   * @param kandidat Reviewkandidat mit korrigiertem Wert.
   * @returns Deutsch formatierter Messwert.
   */
  public korrigierterMesswert(kandidat: ReviewKandidat): string {
    return korrigierterReviewMesswert(kandidat);
  }

  /**
   * Berechnet den Reviewfortschritt des aktiven Kontexts.
   *
   * @param ansicht Vollständiger Reviewzustand.
   * @returns Ganzzahliger Fortschritt zwischen 0 und 100.
   */
  public fortschritt(ansicht: ReviewViewModel): number {
    return reviewFortschritt(this.kandidatenFuerKontext(ansicht));
  }

  /**
   * Bereinigt eine Texteingabe und aktualisiert das gewählte Kandidatenfeld lokal.
   *
   * @param id ID des Reviewkandidaten.
   * @param feld Zu aktualisierendes Textfeld.
   * @param event Eingabeereignis des Formularfelds.
   */
  public textfeldSetzen(id: string, feld: ReviewTextFeld, event: Event): void {
    const eingabe: HTMLInputElement | HTMLTextAreaElement = event.target as HTMLInputElement | HTMLTextAreaElement; // Auslösendes Eingabefeld.
    const typ = feld === 'laborwertKey' ? 'schluessel' : feld === 'korrigierteEinheit' ? 'einheit' : feld === 'kommentar' ? 'freitext' : 'name'; // Passende Bereinigungsregel.
    const maxLaenge: number = feld === 'kommentar' ? 500 : 100; // Maximale Eingabelänge.
    const wert: string = bereinigeSichereEingabe(eingabe.value, typ, maxLaenge); // Bereinigter Eingabewert.

    this.kandidatAktualisieren(id, { [feld]: wert } as Partial<ReviewKandidat>);
  }

  /**
   * Konvertiert eine numerische Eingabe und aktualisiert das gewählte Kandidatenfeld lokal.
   *
   * @param id ID des Reviewkandidaten.
   * @param feld Zu aktualisierendes Zahlenfeld.
   * @param event Eingabeereignis des Zahlenfelds.
   */
  public zahlenfeldSetzen(id: string, feld: ReviewZahlFeld, event: Event): void {
    const eingabe: HTMLInputElement = event.target as HTMLInputElement; // Auslösendes Zahlenfeld.
    const wert: number = Number(eingabe.value.replace(',', '.'));      // Normalisierter Zahlenwert.

    if (Number.isNaN(wert)) {
      return;
    }

    this.kandidatAktualisieren(id, { [feld]: wert } as Partial<ReviewKandidat>);
  }

  /**
   * Stellt einen Kandidaten über die API in den offenen Status zurück.
   *
   * @param kandidat Zurückzustellender Reviewkandidat.
   */
  public kandidatZurueckstellen(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'offen' }, 'Review zurückgestellt', `${kandidat.anzeigename} bleibt in der Warteschlange.`, 'warning');
  }

  /**
   * Speichert die aktuelle Korrektur über die Backend-API.
   *
   * @param kandidat Zu speichernder Reviewkandidat.
   */
  public korrekturSpeichern(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'korrigiert' }, 'Korrektur gespeichert', `${kandidat.anzeigename} wurde in der Datenbank aktualisiert.`, 'success');
  }

  /**
   * Speichert die Korrektur und aktiviert anschließend den nächsten offenen Kandidaten.
   *
   * @param kandidat Zu speichernder Reviewkandidat.
   */
  public speichernUndWeiter(kandidat: ReviewKandidat): void {
    this.kandidatInApiSpeichern({ ...kandidat, status: 'korrigiert' }, 'Korrektur gespeichert', `${kandidat.anzeigename} wurde in der Datenbank aktualisiert.`, 'success', () => {
      const naechster: ReviewKandidat | null = naechsterOffenerReviewKandidat(this.kandidatenFuerKontext(this.review()), kandidat.id); // Nächster prüfbarer Kandidat.

      if (naechster) {
        this.aktiverKandidatId.set(naechster.id);
        return;
      }

      this.toastService.zeige('Review-Kontext abgeschlossen', 'Es gibt keinen weiteren offenen Wert in diesem Befund.', 'success');
    });
  }

  /** Bestätigt alle offenen Werte mit einer Confidence von mindestens 85 Prozent. */
  public sichereWerteBestaetigen(): void {
    const kandidaten: ReviewKandidat[] = this.kandidatenFuerKontext(this.review()).filter((kandidat: ReviewKandidat) => kandidat.confidence >= 85 && kandidat.status === 'offen'); // Sicher erkannte Kandidaten.

    if (!kandidaten.length) {
      this.toastService.zeige('Keine sicheren Werte gefunden', 'Im aktuellen Kontext gibt es keine offenen Werte mit hoher Confidence.', 'info');
      return;
    }

    const ids: string[] = kandidaten.map((kandidat: ReviewKandidat) => kandidat.id); // Zu bestätigende Kandidaten-IDs.

    this.globiFlowApi.reviewKandidatenStatusSetzen(ids, 'bestaetigt').subscribe({
      next: (antwort: ReviewViewModel) => {
        this.review.update((wert: ReviewViewModel) => ({
          ...wert,
          kandidaten: wert.kandidaten.map((kandidat: ReviewKandidat) => antwort.kandidaten.find((eintrag: ReviewKandidat) => eintrag.id === kandidat.id) ?? kandidat)
        }));
        this.patientContext.patientenNeuLaden();
        this.toastService.zeige('Sichere Werte bestätigt', `${kandidaten.length} Werte wurden in der Datenbank bestätigt.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Bestätigung fehlgeschlagen', 'Die Reviewwerte konnten nicht gespeichert werden.', 'danger');
      }
    });
  }

  /** Übernimmt alle geprüften Werte des aktiven Befunds für die nächste Workflowstufe. */
  public gepruefteUebernehmen(): void {
    const kandidaten: ReviewKandidat[] = this.kandidatenFuerKontext(this.review()).filter((kandidat: ReviewKandidat) => kandidat.status === 'bestaetigt' || kandidat.status === 'korrigiert'); // Übernahmefähige Kandidaten.
    const befund: PatientBefund | null = this.patientContext.aktiverBefund(); // Aktiver Befund.

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

  /**
   * Speichert einen Kandidaten optimistisch über die API und stellt Fehlerzustände wieder her.
   *
   * @param kandidat Zu speichernder Reviewkandidat.
   * @param titel Titel der Erfolgsmeldung.
   * @param beschreibung Beschreibung der Erfolgsmeldung.
   * @param status Darstellungsstatus der Erfolgsmeldung.
   * @param nachErfolg Optionale Folgeaktion nach erfolgreicher Speicherung.
   */
  private kandidatInApiSpeichern(kandidat: ReviewKandidat, titel: string, beschreibung: string, status: 'success' | 'warning', nachErfolg?: () => void): void {
    const vorherigerStand: ReviewKandidat | undefined = this.review().kandidaten.find((eintrag: ReviewKandidat) => eintrag.id === kandidat.id); // Zustand vor der optimistischen Änderung.

    this.kandidatAktualisieren(kandidat.id, { status: kandidat.status });
    this.globiFlowApi.reviewKandidatSpeichern(kandidat).subscribe({
      next: (antwort: ReviewKandidat) => {
        this.kandidatAktualisieren(antwort.id, antwort);
        this.patientContext.patientenNeuLaden();
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

  /**
   * Aktualisiert einen Reviewkandidaten im lokalen Signalzustand.
   *
   * @param id ID des zu aktualisierenden Kandidaten.
   * @param patch Teilzustand mit den zu ändernden Feldern.
   */
  private kandidatAktualisieren(id: string, patch: Partial<ReviewKandidat>): void {
    this.review.update((ansicht: ReviewViewModel) => ({
      ...ansicht,
      kandidaten: ansicht.kandidaten.map((kandidat: ReviewKandidat) => kandidat.id === id ? { ...kandidat, ...patch } : kandidat)
    }));
  }

  /**
   * Liefert Kandidaten des aktiven Patienten und Befunds.
   *
   * @param ansicht Vollständiger Reviewzustand.
   * @returns Kandidaten des aktuellen Arbeitskontexts.
   */
  private kandidatenFuerKontext(ansicht: ReviewViewModel): ReviewKandidat[] {
    return kandidatenFuerReviewKontext(ansicht, this.patientContext.aktiverPatient().id, this.patientContext.aktiverBefund()?.id);
  }
}
