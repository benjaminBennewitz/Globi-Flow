/* src/app/pages/importe-page/importe-page.component.ts */

/**
 * @file Routenseite für Upload, Importpipeline und Importhistorie.
 * @module ImportePageComponent
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Importjob } from '../../core/models/importjob.model';
import { pruefeSicherePdfDatei, SICHERE_DATEI_MAX_LABEL } from '../../core/security/sichere-datei.util';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { ImportJobMonitorService } from '../../core/services/import-job-monitor.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ToastService } from '../../shared/services/toast.service';
import { bereinigeSichereEingabe } from '../../core/security/sichere-eingabe.util';
import * as logik from './importe-page-logik';
import { ImportPollingController } from './importe-page-polling';

/** Route `/importe` für Upload, Pipeline-Status und Importhistorie. */
@Component({
  selector: 'gf-importe-page',
  imports: [RouterLink],
  templateUrl: './importe-page.component.html',
  styleUrl: './importe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportePageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);                         // Route mit optionalem Upload-Fokus.
  private readonly toastService = inject(ToastService);                    // Toast-Service für UI-Rückmeldungen.
  private readonly globiFlowApi = inject(GlobiFlowApiService);             // API-Service für Importdaten.
  private readonly patientContext = inject(PatientContextService);         // Globaler Patientenkontext.
  private readonly importJobMonitor = inject(ImportJobMonitorService);     // Monitor für laufende Importjobs.
  private uploadBereich?: ElementRef<HTMLElement>;                         // Referenz auf den Uploadbereich.
  private uploadScrollAusgeführt = false;                                  // Verhindert mehrfaches Fokus-Scrollen.
  private ausgewaehlteDatei: File | null = null;                           // Lokal geprüfte PDF-Datei.
  private readonly polling = new ImportPollingController(() => this.importjobsLaden(true));  // Polling-Steuerung aktiver Jobs.

  public readonly importjobs: WritableSignal<Importjob[]> = signal([]);                    // Importjobs aus der Backend-API.
  public readonly aktiverFilter: WritableSignal<logik.ImportFilter> = signal('alle');      // Aktiver Historienfilter.
  public readonly ausgewaehlterJobId: WritableSignal<string> = signal('');                 // ID des ausgewählten Importjobs.
  public readonly datasetsOffen: WritableSignal<boolean> = signal(false);                  // Öffnungsstatus aller Dataset-Karten.
  public readonly dragAktiv: WritableSignal<boolean> = signal(false);                      // Aktiver Drag-and-drop-Zustand.
  public readonly dateiName: WritableSignal<string> = signal('');                          // Name der ausgewählten PDF-Datei.
  public readonly dateiGroesse: WritableSignal<string> = signal('');                       // Lesbare Größe der ausgewählten Datei.
  public readonly uploadFehler: WritableSignal<string> = signal('');                       // Aktuelle Upload-Fehlermeldung.
  public readonly dateiPruefungAktiv: WritableSignal<boolean> = signal(false);             // Laufende lokale Dateiprüfung.
  public readonly uploadAktiv: WritableSignal<boolean> = signal(false);                    // Laufender Upload-Request.
  public readonly gestarteterJobId: WritableSignal<string> = signal('');                   // Zuletzt gestarteter Importjob.
  public readonly uploadHinweisAktiv: WritableSignal<boolean> = signal(false);             // Animierter Hinweisrahmen der Upload-Zone.
  public readonly manuelleEingabeOffen: WritableSignal<boolean> = signal(false);           // Sichtbarkeit des manuellen Dialogs.
  public readonly manuellLaborwertKey: WritableSignal<string> = signal('crp');             // Laborwert-Key der manuellen Eingabe.
  public readonly manuellAnzeigename: WritableSignal<string> = signal('CRP');              // Anzeigename der manuellen Eingabe.
  public readonly manuellErgebnis: WritableSignal<string> = signal('8,6');                 // Ergebnis der manuellen Eingabe.
  public readonly manuellEinheit: WritableSignal<string> = signal('mg/l');                 // Einheit der manuellen Eingabe.
  public readonly manuellReferenz: WritableSignal<string> = signal('< 5,0');               // Referenzbereich der manuellen Eingabe.
  public readonly dateiLimit = SICHERE_DATEI_MAX_LABEL;                                    // Lesbares Uploadlimit für die UI.

  /** Registriert den Uploadbereich, sobald er gerendert wurde. */
  @ViewChild('uploadBereich')
  public set uploadBereichSetzen(element: ElementRef<HTMLElement> | undefined) {
    this.uploadBereich = element;
    this.uploadBereichInViewSetzen();
  }

  /** Initialisiert optionale Upload-Fokusparameter. */
  public constructor() {
    this.importjobsLaden();

    this.route.queryParamMap.subscribe((parameter) => {
      this.uploadScrollAusgeführt = false;
      this.uploadHinweisAktiv.set(parameter.get('fokus') === 'upload');
      this.uploadBereichInViewSetzen();
    });
  }

  /** Lädt Importjobs aus der API. */
  private importjobsLaden(still: boolean = false): void {
    this.globiFlowApi.ladeImportjobs().subscribe((jobs: Importjob[]) => {
      const bisherAktiv = this.ausgewaehlterJobId();
      const gestarteterJob = jobs.find((job: Importjob) => job.id === this.gestarteterJobId());
      this.importjobs.set(jobs);
      this.polling.nachStatusAktualisieren(jobs);

      if (gestarteterJob && this.importLaeuft(gestarteterJob)) {
        this.ausgewaehlterJobId.set(gestarteterJob.id);
        return;
      }

      if (!still || !jobs.some((job: Importjob) => job.id === bisherAktiv)) {
        this.ausgewaehlterJobId.set(jobs[0]?.id ?? '');
      }
    });
  }

  /** Räumt den Import-Poller beim Verlassen der Route auf. */
  public ngOnDestroy(): void {
    this.polling.stoppen();
  }

  /** Beschriftete Filteroptionen der Importhistorie. */
  public readonly filterOptionen = logik.FILTER_OPTIONEN;

  /** Reine Anzeige-, Filter- und Statusfunktionen der Importseite. */
  public readonly kennzahlen = logik.kennzahlen;                    // Berechnet die Importkennzahlen.
  public readonly statusKlasse = logik.statusKlasse;                // Erzeugt die Jobstatusklasse.
  public readonly schrittKlasse = logik.schrittKlasse;              // Erzeugt die Schrittstatusklasse.
  public readonly datasetKlasse = logik.datasetKlasse;              // Erzeugt die Dataset-Statusklasse.
  public readonly analyseLabel = logik.analyseLabel;                // Übersetzt die Analyseart.
  public readonly ocrLabel = logik.ocrLabel;                        // Übersetzt den OCR-Status.
  public readonly importLaeuft = logik.importLaeuft;                // Prüft den Verarbeitungsstatus.
  public readonly laufenderJobHinweis = logik.laufenderJobHinweis;  // Beschreibt die Hintergrundverarbeitung.

  /**
   * Filtert die Importhistorie anhand des aktiven Filters.
   *
   * @param importjobs Vollständige Liste geladener Importjobs.
   * @returns Gefilterte Importhistorie.
   */
  public gefilterteJobs(importjobs: Importjob[]): Importjob[] {
    return logik.gefilterteJobs(importjobs, this.aktiverFilter());
  }

  /**
   * Ermittelt den aktuell ausgewählten Importjob.
   *
   * @param importjobs Aktuell geladene Importjobs.
   * @returns Ausgewählter Job, erster Eintrag oder null.
   */
  public ausgewaehlterJob(importjobs: Importjob[]): Importjob | null {
    return logik.ausgewaehlterJob(importjobs, this.ausgewaehlterJobId());
  }

  /** Setzt den aktiven Historienfilter. */
  public filterSetzen(filter: logik.ImportFilter): void { this.aktiverFilter.set(filter); }

  /** Setzt den aktiven Detailjob. */
  public jobAuswaehlen(job: Importjob): void { this.ausgewaehlterJobId.set(job.id); }

  /** Öffnet oder schließt alle Dataset-Karten. */
  public datasetsUmschalten(): void { this.datasetsOffen.update((wert: boolean) => !wert); }

  /** Prüft, ob ein Job ausgewählt ist. */
  public istAusgewaehlt(job: Importjob): boolean { return this.ausgewaehlterJobId() === job.id; }

  /** Lädt die optimierte Testdaten-PDF aus den lokalen Assets herunter. */
  public testdatenPdfHerunterladen(): void {
    const link = document.createElement('a');
    link.href = 'assets/testdaten/testdaten-laborbefund-demo.pdf';
    link.download = 'testdaten-laborbefund-demo.pdf';
    link.click();
    this.toastService.zeige('Testdaten-PDF vorbereitet', 'Die lokale Demo-PDF wurde zum Download geöffnet.', 'success');
  }

  /** Startet eine vollständige Demo-Analyse im Backend. */
  public demoAnalyseStarten(): void {
    this.globiFlowApi.demoAnalyseStarten().subscribe((job: Importjob) => {
      this.importjobs.update((jobs: Importjob[]) => [job, ...jobs.filter((eintrag: Importjob) => eintrag.id !== job.id)]);
      this.ausgewaehlterJobId.set(job.id);
      this.aktiverFilter.set('alle');
      this.importJobMonitor.importJobBeobachten(job);
      this.polling.nachStatusAktualisieren([job]);
      this.toastService.zeige('Demo-Analyse gestartet', 'Der Importjob wurde aus der Backend-API geladen.', 'success');
    });
  }

  /** Startet den API-Upload mit der ausgewählten Datei. */
  public importStarten(): void {
    if (!this.ausgewaehlteDatei || !this.dateiName()) {
      this.dateiBlockieren('Bitte zuerst eine gültige Testdaten-PDF auswählen.');
      return;
    }

    const aktiverPatient = this.patientContext.aktiverPatient();
    this.uploadAktiv.set(true);

    this.globiFlowApi.laborbefundHochladen(this.ausgewaehlteDatei, aktiverPatient.id).subscribe({
      next: (job: Importjob) => {
        this.importjobs.update((jobs: Importjob[]) => [job, ...jobs.filter((eintrag: Importjob) => eintrag.id !== job.id)]);
        this.ausgewaehlterJobId.set(job.id);
        this.gestarteterJobId.set(job.id);
        this.aktiverFilter.set('alle');
        this.dateiEntfernen();
        this.uploadAktiv.set(false);
        this.importJobMonitor.importJobBeobachten(job);
        this.polling.starten();
        this.importjobsLaden(true);
        this.toastService.zeige('Importjob läuft', `Die PDF wurde ${aktiverPatient.name} zugeordnet. OCR läuft im Hintergrund weiter.`, 'success');
      },
      error: () => {
        this.uploadAktiv.set(false);
        this.toastService.zeige('Upload fehlgeschlagen', 'Die API konnte die PDF nicht annehmen oder analysieren.', 'danger');
      }
    });
  }

  /** Öffnet die manuelle Fallback-Eingabe. */
  public manuelleEingabeOeffnen(): void { this.manuelleEingabeOffen.set(true); }

  /** Schließt die manuelle Fallback-Eingabe. */
  public manuelleEingabeSchliessen(): void { this.manuelleEingabeOffen.set(false); }

  /** Aktualisiert ein manuelles Eingabefeld sicher. */
  public manuellesFeldSetzen(feld: 'key' | 'name' | 'ergebnis' | 'einheit' | 'referenz', event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const typ = feld === 'key' ? 'schluessel' : feld === 'name' ? 'name' : feld === 'einheit' ? 'einheit' : feld === 'referenz' ? 'referenz' : 'freitext';
    const wert = bereinigeSichereEingabe(eingabe.value, typ, 80);

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

  /** Legt einen manuellen Importjob als Backend-Fallback an. */
  public manuelleEingabeAnlegen(): void {
    const name = this.manuellAnzeigename().trim() || 'Manueller Laborwert';

    this.globiFlowApi.manuellenImportAnlegen({
      patientId: this.patientContext.aktiverPatient().id,
      key: this.manuellLaborwertKey().trim(),
      name,
      ergebnis: this.manuellErgebnis().trim(),
      einheit: this.manuellEinheit().trim(),
      referenz: this.manuellReferenz().trim()
    }).subscribe({
      next: (job: Importjob) => {
        this.importjobs.update((jobs: Importjob[]) => [job, ...jobs.filter((eintrag: Importjob) => eintrag.id !== job.id)]);
        this.ausgewaehlterJobId.set(job.id);
        this.manuelleEingabeSchliessen();
        this.patientContext.patientenNeuLaden();
        this.toastService.zeige('Manuelle Eingabe angelegt', `${name} wurde als Review-Fallback gespeichert.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Manuelle Eingabe fehlgeschlagen', `${name} konnte nicht gespeichert werden.`, 'danger');
      }
    });
  }

  /** Deaktiviert den Upload-Hinweis nach erster bewusster Interaktion. */
  public uploadHinweisDeaktivieren(): void { this.uploadHinweisAktiv.set(false); }

  /** Verhindert Browsernavigation beim Drag-over. */
  public dateiDragOver(event: DragEvent): void {
    event.preventDefault();
    this.uploadHinweisDeaktivieren();

    if (this.dragEnthaeltDatei(event)) {
      this.dragAktiv.set(true);
    }
  }

  /** Setzt den Dragstatus zurück. */
  public dateiDragLeave(): void { this.dragAktiv.set(false); }

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
    this.ausgewaehlteDatei = null;
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

    this.ausgewaehlteDatei = datei ?? null;
    this.dateiName.set(ergebnis.dateiname);
    this.dateiGroesse.set(ergebnis.groesse);
    this.uploadFehler.set('');
    this.toastService.zeige('PDF geprüft', 'Die Datei ist bereit für den lokalen API-Import.', 'success');
  }

  /** Entfernt die aktive Datei und zeigt einen Uploadfehler. */
  private dateiBlockieren(meldung: string): void {
    this.ausgewaehlteDatei = null;
    this.dateiName.set('');
    this.dateiGroesse.set('');
    this.dateiPruefungAktiv.set(false);
    this.uploadFehler.set(meldung);
    this.toastService.zeige('Upload blockiert', meldung, 'danger');
  }
}
