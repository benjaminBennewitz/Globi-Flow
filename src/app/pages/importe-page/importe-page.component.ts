/* src/app/pages/importe-page/importe-page.component.ts */

/**
 * @file Routenseite für Upload, Importpipeline und Importhistorie.
 * @module ImportePageComponent
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Importjob, ImportjobDataset, ImportjobOcrStatus, ImportjobSchrittStatus, ImportjobStatus } from '../../core/models/importjob.model';
import { pruefeSicherePdfDatei, SICHERE_DATEI_MAX_LABEL } from '../../core/security/sichere-datei.util';
import { DatenDashboardApiService } from '../../core/services/daten-dashboard-api.service';

/** Importlistenfilter für Statusgruppen. */
type ImportFilter = 'alle' | 'aktiv' | 'review' | 'ocr' | 'fehler' | 'abgeschlossen';

/** Kompakte Kennzahl der Importseite. */
interface ImportKennzahl {
  /** Anzeigename der Kennzahl. */
  label: string;

  /** Anzeigenwert der Kennzahl. */
  wert: string | number;

  /** Zusätzlicher Kurztext. */
  hinweis: string;

  /** Material-Symbol der Kennzahl. */
  icon: string;

  /** Optionale Statusklasse. */
  status?: string;
}

/** Route `/importe` für Upload, Pipeline-Status und Importhistorie. */
@Component({
  selector: 'dd-importe-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './importe-page.component.html',
  styleUrl: './importe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportePageComponent {
  /** API-bereiter Datenservice. */
  private readonly datenDashboardApi = inject(DatenDashboardApiService);

  /** Aktuelle Route mit optionalem Upload-Fokus. */
  private readonly route = inject(ActivatedRoute);

  /** Uploadbereich für automatisches Scrollen. */
  private uploadBereich?: ElementRef<HTMLElement>;

  /** Verhindert mehrfaches Scrollen innerhalb eines Fokuszyklus. */
  private uploadScrollAusgeführt = false;

  /** Importjobs aus Mockdaten oder später API. */
  protected readonly importjobs$ = this.datenDashboardApi.ladeImportjobs();

  /** Aktiver Importfilter. */
  public readonly aktiverFilter: WritableSignal<ImportFilter> = signal('alle');

  /** Aktuell ausgewählter Importjob. */
  public readonly ausgewaehlterJobId: WritableSignal<string> = signal('import-demo-001');

  /** Gibt an, ob alle Dataset-Karten geöffnet sind. */
  public readonly datasetsOffen: WritableSignal<boolean> = signal(false);

  /** Gibt an, ob die Upload-Zone aktiv gezogen wird. */
  public readonly dragAktiv: WritableSignal<boolean> = signal(false);

  /** Aktuell ausgewählte Datei für den späteren Upload. */
  public readonly dateiName: WritableSignal<string> = signal('');

  /** Lesbare Größe der ausgewählten Datei. */
  public readonly dateiGroesse: WritableSignal<string> = signal('');

  /** Aktuelle Upload-Fehlermeldung. */
  public readonly uploadFehler: WritableSignal<string> = signal('');

  /** Gibt an, ob eine Datei aktuell geprüft wird. */
  public readonly dateiPruefungAktiv: WritableSignal<boolean> = signal(false);

  /** Aktiviert den animierten Hinweisrahmen für die Upload-Zone. */
  public readonly uploadHinweisAktiv: WritableSignal<boolean> = signal(false);

  /** Lesbares Uploadlimit für die UI. */
  public readonly dateiLimit = SICHERE_DATEI_MAX_LABEL;

  /** Registriert den Uploadbereich, sobald er durch Async-Daten gerendert wurde. */
  @ViewChild('uploadBereich')
  public set uploadBereichSetzen(element: ElementRef<HTMLElement> | undefined) {
    this.uploadBereich = element;
    this.uploadBereichInViewSetzen();
  }

  /** Initialisiert optionale Upload-Fokusparameter. */
  public constructor() {
    this.route.queryParamMap.subscribe((parameter) => {
      this.uploadScrollAusgeführt = false;
      this.uploadHinweisAktiv.set(parameter.get('fokus') === 'upload');
      this.uploadBereichInViewSetzen();
    });
  }

  /** Importfilter für die Historie. */
  public readonly filterOptionen: { key: ImportFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'aktiv', label: 'Aktiv' },
    { key: 'review', label: 'Review' },
    { key: 'ocr', label: 'OCR' },
    { key: 'fehler', label: 'Fehler' },
    { key: 'abgeschlossen', label: 'Freigegeben' }
  ];

  /** Erzeugt die Kennzahlen der Importseite. */
  public kennzahlen(importjobs: Importjob[]): ImportKennzahl[] {
    const aktiveJobs = importjobs.filter((job: Importjob) => job.status === 'wartet' || job.status === 'analysiert').length;
    const reviewJobs = importjobs.filter((job: Importjob) => job.status === 'review').length;
    const ocrJobs = importjobs.filter((job: Importjob) => job.ocrStatus !== 'nicht_erforderlich').length;
    const fehlerJobs = importjobs.filter((job: Importjob) => job.status === 'fehler').length;
    const confidence = this.durchschnitt(importjobs.filter((job: Importjob) => job.confidence > 0).map((job: Importjob) => job.confidence));

    return [
      { label: 'Aktive Jobs', wert: aktiveJobs, hinweis: 'laufen oder warten', icon: 'sync', status: 'info' },
      { label: 'Warten auf Review', wert: reviewJobs, hinweis: 'ärztlich prüfen', icon: 'fact_check', status: 'warning' },
      { label: 'OCR erforderlich', wert: ocrJobs, hinweis: 'lokale OCR-Pipeline', icon: 'document_scanner', status: 'info' },
      { label: 'Fehlerhafte Importe', wert: fehlerJobs, hinweis: 'Retry oder manuell', icon: 'error', status: 'danger' },
      { label: 'Ø Confidence', wert: `${confidence}%`, hinweis: 'erkannte Werte', icon: 'verified', status: 'success' }
    ];
  }

  /** Filtert Importjobs anhand des aktiven Statusfilters. */
  public gefilterteJobs(importjobs: Importjob[]): Importjob[] {
    const filter = this.aktiverFilter();

    if (filter === 'aktiv') {
      return importjobs.filter((job: Importjob) => job.status === 'wartet' || job.status === 'analysiert');
    }

    if (filter === 'ocr') {
      return importjobs.filter((job: Importjob) => job.ocrStatus !== 'nicht_erforderlich');
    }

    if (filter === 'alle') {
      return importjobs;
    }

    return importjobs.filter((job: Importjob) => job.status === filter);
  }

  /** Gibt den aktuell ausgewählten oder ersten Importjob zurück. */
  public ausgewaehlterJob(importjobs: Importjob[]): Importjob | null {
    return importjobs.find((job: Importjob) => job.id === this.ausgewaehlterJobId()) ?? importjobs[0] ?? null;
  }

  /** Setzt den aktiven Historienfilter. */
  public filterSetzen(filter: ImportFilter): void {
    this.aktiverFilter.set(filter);
  }

  /** Setzt den aktiven Detailjob. */
  public jobAuswaehlen(job: Importjob): void {
    this.ausgewaehlterJobId.set(job.id);
  }

  /** Öffnet oder schließt alle Dataset-Karten. */
  public datasetsUmschalten(): void {
    this.datasetsOffen.update((wert: boolean) => !wert);
  }

  /** Prüft, ob ein Job ausgewählt ist. */
  public istAusgewaehlt(job: Importjob): boolean {
    return this.ausgewaehlterJobId() === job.id;
  }

  /** Gibt eine CSS-Klasse für den Jobstatus zurück. */
  public statusKlasse(status: ImportjobStatus): string {
    return `is-${status}`;
  }

  /** Gibt eine CSS-Klasse für Pipeline-Schritte zurück. */
  public schrittKlasse(status: ImportjobSchrittStatus): string {
    return `is-${status}`;
  }

  /** Gibt eine CSS-Klasse für Dataset-Karten zurück. */
  public datasetKlasse(dataset: ImportjobDataset): string {
    return `is-${dataset.status}`;
  }

  /** Gibt ein lesbares Analyse-Label zurück. */
  public analyseLabel(job: Importjob): string {
    const labels = {
      textschicht: 'Textschicht',
      ocr: 'Lokale OCR',
      demo: 'Demo'
    };

    return labels[job.analyseArt];
  }

  /** Gibt ein lesbares OCR-Label zurück. */
  public ocrLabel(status: ImportjobOcrStatus): string {
    const labels = {
      nicht_erforderlich: 'Nicht erforderlich',
      erforderlich: 'Erforderlich',
      aktiv: 'Aktiv',
      abgeschlossen: 'Abgeschlossen',
      fehler: 'Fehler'
    };

    return labels[status];
  }

  /** Deaktiviert den Upload-Hinweis nach erster bewusster Interaktion. */
  public uploadHinweisDeaktivieren(): void {
    this.uploadHinweisAktiv.set(false);
  }

  /** Verhindert Browsernavigation beim Drag-over. */
  public dateiDragOver(event: DragEvent): void {
    event.preventDefault();
    this.uploadHinweisDeaktivieren();

    if (this.dragEnthaeltDatei(event)) {
      this.dragAktiv.set(true);
    }
  }

  /** Setzt den Dragstatus zurück. */
  public dateiDragLeave(): void {
    this.dragAktiv.set(false);
  }

  /** Übernimmt eine per Drag-and-drop abgelegte Datei. */
  public async dateiDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.uploadHinweisDeaktivieren();
    this.dragAktiv.set(false);

    if (!this.dragEnthaeltDatei(event)) {
      this.dateiBlockieren('Nur lokale PDF-Dateien können hochgeladen werden.');
      return;
    }

    if ((event.dataTransfer?.files.length ?? 0) > 1) {
      this.dateiBlockieren('Bitte nur eine PDF-Datei gleichzeitig hochladen.');
      return;
    }

    await this.dateiPruefenUndSetzen(event.dataTransfer?.files.item(0));
  }

  /** Übernimmt eine per Dateiauswahl gewählte Datei. */
  public async dateiAuswahlAendern(event: Event): Promise<void> {
    this.uploadHinweisDeaktivieren();

    const eingabe = event.target as HTMLInputElement;
    await this.dateiPruefenUndSetzen(eingabe.files?.item(0));
    eingabe.value = '';
  }

  /** Entfernt die aktuell ausgewählte Datei. */
  public dateiEntfernen(): void {
    this.dateiName.set('');
    this.dateiGroesse.set('');
    this.uploadFehler.set('');
  }

  /** Scrollt die Upload-Zone beim externen Importaufruf sauber in die View. */
  private uploadBereichInViewSetzen(): void {
    if (!this.uploadHinweisAktiv() || this.uploadScrollAusgeführt || !this.uploadBereich) {
      return;
    }

    this.uploadScrollAusgeführt = true;

    window.setTimeout(() => {
      this.uploadBereich?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 120);
  }

  /** Prüft, ob das Drag-Event eine Datei enthält. */
  private dragEnthaeltDatei(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }

  /** Prüft und übernimmt eine Datei für den späteren API-Upload. */
  private async dateiPruefenUndSetzen(datei: File | null | undefined): Promise<void> {
    this.dateiPruefungAktiv.set(true);
    this.uploadFehler.set('');

    const ergebnis = await pruefeSicherePdfDatei(datei);

    this.dateiPruefungAktiv.set(false);

    if (!ergebnis.istGueltig) {
      this.dateiBlockieren(ergebnis.meldung);
      return;
    }

    this.dateiName.set(ergebnis.dateiname);
    this.dateiGroesse.set(ergebnis.groesse);
    this.uploadFehler.set('');
  }

  /** Entfernt die aktive Datei und zeigt einen Uploadfehler. */
  private dateiBlockieren(meldung: string): void {
    this.dateiName.set('');
    this.dateiGroesse.set('');
    this.dateiPruefungAktiv.set(false);
    this.uploadFehler.set(meldung);
  }

  /** Berechnet einen gerundeten Durchschnitt. */
  private durchschnitt(werte: number[]): number {
    if (!werte.length) {
      return 0;
    }

    return Math.round(werte.reduce((summe: number, wert: number) => summe + wert, 0) / werte.length);
  }
}
