/* src/app/pages/importe-page/importe-page.component.ts */

/**
 * @file Routenseite für Upload, Importpipeline und Importhistorie.
 * @module ImportePageComponent
 */

import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MOCK_IMPORTJOBS } from '../../core/mocks/importjobs.mock';
import { Importjob, ImportjobAnalyseArt, ImportjobDataset, ImportjobOcrStatus, ImportjobSchrittStatus, ImportjobStatus } from '../../core/models/importjob.model';
import { pruefeSicherePdfDatei, SICHERE_DATEI_MAX_LABEL } from '../../core/security/sichere-datei.util';
import { ToastService } from '../../shared/services/toast.service';

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
  imports: [RouterLink],
  templateUrl: './importe-page.component.html',
  styleUrl: './importe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportePageComponent {
  /** Aktuelle Route mit optionalem Upload-Fokus. */
  private readonly route = inject(ActivatedRoute);

  /** Toast-Service für UI-Rückmeldungen. */
  private readonly toastService = inject(ToastService);

  /** Uploadbereich für automatisches Scrollen. */
  private uploadBereich?: ElementRef<HTMLElement>;

  /** Verhindert mehrfaches Scrollen innerhalb eines Fokuszyklus. */
  private uploadScrollAusgeführt = false;

  /** Importjobs aus lokalen Mockdaten bis zur späteren API-Anbindung. */
  public readonly importjobs: WritableSignal<Importjob[]> = signal([...MOCK_IMPORTJOBS]);

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

  /** Sichtbarkeit des manuellen Eingabe-Dialogs. */
  public readonly manuelleEingabeOffen: WritableSignal<boolean> = signal(false);

  /** Laborwert-Key der manuellen Eingabe. */
  public readonly manuellLaborwertKey: WritableSignal<string> = signal('crp');

  /** Anzeigename der manuellen Eingabe. */
  public readonly manuellAnzeigename: WritableSignal<string> = signal('CRP');

  /** Ergebnis der manuellen Eingabe. */
  public readonly manuellErgebnis: WritableSignal<string> = signal('8,6');

  /** Einheit der manuellen Eingabe. */
  public readonly manuellEinheit: WritableSignal<string> = signal('mg/l');

  /** Referenzbereich der manuellen Eingabe. */
  public readonly manuellReferenz: WritableSignal<string> = signal('< 5,0');

  /** Lesbares Uploadlimit für die UI. */
  public readonly dateiLimit = SICHERE_DATEI_MAX_LABEL;

  /** Registriert den Uploadbereich, sobald er gerendert wurde. */
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
    const labels: Record<ImportjobAnalyseArt, string> = {
      textschicht: 'Textschicht',
      ocr: 'Lokale OCR',
      demo: 'Demo'
    };

    return labels[job.analyseArt];
  }

  /** Gibt ein lesbares OCR-Label zurück. */
  public ocrLabel(status: ImportjobOcrStatus): string {
    const labels: Record<ImportjobOcrStatus, string> = {
      nicht_erforderlich: 'Nicht erforderlich',
      erforderlich: 'Erforderlich',
      aktiv: 'Aktiv',
      abgeschlossen: 'Abgeschlossen',
      fehler: 'Fehler'
    };

    return labels[status];
  }

  /** Lädt die optimierte Testdaten-PDF aus den lokalen Assets herunter. */
  public testdatenPdfHerunterladen(): void {
    const link = document.createElement('a');
    link.href = 'assets/testdaten/testdaten-laborbefund-demo.pdf';
    link.download = 'testdaten-laborbefund-demo.pdf';
    link.click();
    this.toastService.zeige('Testdaten-PDF vorbereitet', 'Die lokale Demo-PDF wurde zum Download geöffnet.', 'success');
  }

  /** Startet eine vollständige Demo-Analyse als lokalen Mockjob. */
  public demoAnalyseStarten(): void {
    const job = this.simuliertenJobErstellen('testdaten-laborbefund-demo.pdf', 'Demo Testperson', 'demo', 'review', 100, 92);
    this.importjobs.update((jobs: Importjob[]) => [job, ...jobs]);
    this.ausgewaehlterJobId.set(job.id);
    this.aktiverFilter.set('alle');
    this.toastService.zeige('Demo-Analyse gestartet', 'Ein vollständiger Importjob wurde lokal simuliert.', 'success');
  }

  /** Startet einen lokalen Mockimport mit der ausgewählten Datei. */
  public importStarten(): void {
    if (!this.dateiName()) {
      this.dateiBlockieren('Bitte zuerst eine gültige Testdaten-PDF auswählen.');
      return;
    }

    const job = this.simuliertenJobErstellen(this.dateiName(), 'Aktive Testperson', 'textschicht', 'analysiert', 68, 84);
    this.importjobs.update((jobs: Importjob[]) => [job, ...jobs]);
    this.ausgewaehlterJobId.set(job.id);
    this.dateiEntfernen();
    this.toastService.zeige('Importjob angelegt', 'Der lokale Mockjob zeigt Pipeline, Confidence und Reviewbedarf.', 'success');
  }

  /** Öffnet die manuelle Fallback-Eingabe. */
  public manuelleEingabeOeffnen(): void {
    this.manuelleEingabeOffen.set(true);
  }

  /** Schließt die manuelle Fallback-Eingabe. */
  public manuelleEingabeSchliessen(): void {
    this.manuelleEingabeOffen.set(false);
  }

  /** Aktualisiert ein manuelles Eingabefeld sicher. */
  public manuellesFeldSetzen(feld: 'key' | 'name' | 'ergebnis' | 'einheit' | 'referenz', event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const wert = eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '').slice(0, 80);

    if (feld === 'key') {
      this.manuellLaborwertKey.set(wert);
    } else if (feld === 'name') {
      this.manuellAnzeigename.set(wert);
    } else if (feld === 'ergebnis') {
      this.manuellErgebnis.set(wert);
    } else if (feld === 'einheit') {
      this.manuellEinheit.set(wert);
    } else {
      this.manuellReferenz.set(wert);
    }
  }

  /** Legt einen manuellen Importjob als Fallback an. */
  public manuelleEingabeAnlegen(): void {
    const name = this.manuellAnzeigename().trim() || 'Manueller Laborwert';
    const job = this.simuliertenJobErstellen('manuelle-erfassung-demo.pdf', 'Manuelle Testperson', 'textschicht', 'review', 100, 76);
    const angereicherterJob: Importjob = {
      ...job,
      dateiname: 'manuelle-erfassung-demo.pdf',
      pipelineSchritt: 'Manuelle Erfassung für Review vorbereitet',
      erkannteWerte: 1,
      unsichereWerte: 1,
      datasets: [{ id: `dataset-manuell-${Date.now()}`, name, werte: 1, review: 1, confidence: 76, status: 'review' }],
      logEintraege: [
        { id: `log-manuell-${Date.now()}-1`, zeitpunkt: this.zeitLabel(), titel: 'Manuelle Eingabe erfasst', beschreibung: `${name} ${this.manuellErgebnis()} ${this.manuellEinheit()} · Referenz ${this.manuellReferenz()}`, status: 'review' }
      ]
    };

    this.importjobs.update((jobs: Importjob[]) => [angereicherterJob, ...jobs]);
    this.ausgewaehlterJobId.set(angereicherterJob.id);
    this.manuelleEingabeSchliessen();
    this.toastService.zeige('Manuelle Eingabe angelegt', `${name} wurde als Review-Fallback vorbereitet.`, 'success');
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
    this.toastService.zeige('PDF geprüft', 'Die Datei ist bereit für den lokalen Mockimport.', 'success');
  }

  /** Entfernt die aktive Datei und zeigt einen Uploadfehler. */
  private dateiBlockieren(meldung: string): void {
    this.dateiName.set('');
    this.dateiGroesse.set('');
    this.dateiPruefungAktiv.set(false);
    this.uploadFehler.set(meldung);
    this.toastService.zeige('Upload blockiert', meldung, 'danger');
  }

  /** Erstellt einen wiederverwendbaren lokalen Importjob. */
  private simuliertenJobErstellen(dateiname: string, testperson: string, analyseArt: ImportjobAnalyseArt, status: ImportjobStatus, fortschritt: number, confidence: number): Importjob {
    const zeit = this.zeitLabel();
    return {
      id: `import-local-${Date.now()}`,
      dateiname,
      testperson,
      analyseArt,
      status,
      fortschritt,
      pipelineSchritt: status === 'review' ? 'Review vorbereitet' : 'Tabellenstruktur erkennen',
      ocrStatus: 'nicht_erforderlich',
      erkannteWerte: status === 'review' ? 42 : 18,
      unsichereWerte: status === 'review' ? 5 : 3,
      confidence,
      erstelltAm: `12.06.2026 · ${zeit}`,
      aktualisiertAm: `12.06.2026 · ${zeit}`,
      schritte: [
        { key: 'upload', name: 'Upload geprüft', beschreibung: 'Datei wurde im Frontend validiert und lokal simuliert.', status: 'erledigt', abgeschlossen: true },
        { key: 'text', name: 'Textschicht geprüft', beschreibung: 'Demo-Textschicht für die UI-Simulation vorbereitet.', status: 'erledigt', abgeschlossen: true },
        { key: 'ocr', name: 'OCR-Fallback geprüft', beschreibung: 'OCR ist in diesem Mockjob nicht erforderlich.', status: 'uebersprungen', abgeschlossen: true },
        { key: 'table', name: 'Tabellen erkannt', beschreibung: 'Tabellenstruktur wird als Demo-Ergebnis angezeigt.', status: status === 'review' ? 'erledigt' : 'aktiv', abgeschlossen: status === 'review' },
        { key: 'values', name: 'Werte extrahiert', beschreibung: 'Laborwerte und Referenzbereiche wurden im Mock erzeugt.', status: status === 'review' ? 'erledigt' : 'wartet', abgeschlossen: status === 'review' },
        { key: 'confidence', name: 'Confidence berechnet', beschreibung: 'Unsichere Werte werden für den Review markiert.', status: status === 'review' ? 'erledigt' : 'wartet', abgeschlossen: status === 'review' }
      ],
      datasets: [
        { id: `dataset-local-blut-${Date.now()}`, name: 'Blutbild', werte: 10, review: 1, confidence: 93, status: 'review' },
        { id: `dataset-local-fett-${Date.now()}`, name: 'Fettstoffwechsel', werte: 8, review: 2, confidence: 84, status: 'review' },
        { id: `dataset-local-zucker-${Date.now()}`, name: 'Zuckerstoffwechsel', werte: 6, review: 0, confidence: 95, status: 'normal' }
      ],
      logEintraege: [
        { id: `log-local-${Date.now()}-1`, zeitpunkt: zeit, titel: 'Mockjob angelegt', beschreibung: 'Der Import wurde lokal als Frontend-Simulation angelegt.', status: 'info' },
        { id: `log-local-${Date.now()}-2`, zeitpunkt: zeit, titel: 'Reviewbedarf markiert', beschreibung: 'Unsichere Werte werden an die Review-Route übergeben.', status: 'review' }
      ]
    };
  }

  /** Gibt eine kompakte Uhrzeit für Mock-Ereignisse zurück. */
  private zeitLabel(): string {
    return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  /** Berechnet einen gerundeten Durchschnitt. */
  private durchschnitt(werte: number[]): number {
    if (!werte.length) {
      return 0;
    }

    return Math.round(werte.reduce((summe: number, wert: number) => summe + wert, 0) / werte.length);
  }
}
