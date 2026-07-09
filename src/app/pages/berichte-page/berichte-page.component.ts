/* src/app/pages/berichte-page/berichte-page.component.ts */

/**
 * @file Routenseite für druckfertige DIN-A4-Patientenberichte.
 * @module BerichtePageComponent
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { BerichtLaborwert, BerichtPruefEintrag, BerichtViewModel, BerichtWertStatus } from '../../core/models/bericht.model';
import { Patient, PatientBefund } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { ToastService } from '../../shared/services/toast.service';

/** Route `/berichte` für Berichtsvorschau und Printansicht. */
@Component({
  selector: 'gf-berichte-page',
  imports: [],
  templateUrl: './berichte-page.component.html',
  styleUrl: './berichte-page.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerichtePageComponent {
  /** Globaler Arbeitskontext für Patient und Befund. */
  public readonly patientContext = inject(PatientContextService);

  /** Toast-Service für Freigabehinweise. */
  private readonly toastService = inject(ToastService);

  /** API-Service für Berichtsdaten. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Druckfertige Berichtsdaten aus der API. */
  public readonly bericht = signal<BerichtViewModel>({ id: '', berichtsdatum: '', version: '1.0', gesamtstatus: '', gesamttext: '', gesamtWerte: 0, gepruefteWerte: 0, normaleWerte: 0, auffaelligeWerte: 0, reviewWerte: 0, werte: [], kategorien: [], empfehlungen: [], fragen: [], quellen: [], disclaimer: '', istDruckbar: false, wissensbasisVollstaendig: true, fehlendeWissensbasisTexte: [], offeneReviewEintraege: [] });

  /** Sichtbarkeit der Wissensbasis-Detailbox. */
  public readonly wissensbasisDetailsOffen = signal(false);

  /** Aktiver Patient. */
  public readonly patient = computed(() => this.patientContext.aktiverPatient());

  /** Aktiver Befund. */
  public readonly befund = computed(() => this.patientContext.aktiverBefund());

  /** Lädt die Berichtsdaten aus der API. */
  public constructor() {
    effect(() => {
      const patientId = this.patient().id;
      const befundId = this.befund()?.id;
      this.berichtLaden(befundId, patientId);
    });
  }

  /** Lädt die Berichtsvorschau für den aktiven Patientenkontext neu. */
  public vorschauAktualisieren(): void {
    this.berichtLaden(this.befund()?.id, this.patient().id);
  }

  /** Auffällige oder prüfpflichtige Werte für die interne Kurzsicht. */
  public readonly auffaelligeWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status !== 'normal'));

  /** Noch nicht druckfreigegebene Werte aus der Werteliste. */
  public readonly offenePruefwerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status === 'review'));

  /** Noch offene Backend-Reviewpunkte. */
  public readonly offeneReviewEintraege = computed(() => this.bericht().offeneReviewEintraege ?? []);

  /** Anzahl aller offenen Reviewpunkte. */
  public readonly offeneReviewAnzahl = computed(() => Math.max(this.bericht().reviewWerte, this.offenePruefwerte().length, this.offeneReviewEintraege().length));

  /** Fehlende Wissensbasis-Texte aus Backend oder Fallback aus Werteliste. */
  public readonly fehlendeWissensbasisTexte = computed<BerichtPruefEintrag[]>(() => {
    const backendEintraege = this.bericht().fehlendeWissensbasisTexte ?? [];
    if (backendEintraege.length) {
      return backendEintraege;
    }

    return this.bericht().werte
      .filter((wert: BerichtLaborwert) => !wert.erklaerung)
      .map((wert: BerichtLaborwert) => ({ id: wert.key, name: wert.name, gruppe: wert.gruppe, hinweis: 'Patientenkurztext in der Wissensbasis fehlt.' }));
  });

  /** Druckfähige Werte ohne offene Reviewwerte. */
  public readonly freigegebeneWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status !== 'review'));

  /** Aussagekräftige Trendwerte mit echtem Verlauf. */
  public readonly trendWerte = computed(() => this.freigegebeneWerte().filter((wert: BerichtLaborwert) => wert.status !== 'normal' && wert.trend !== 'stabil' && wert.verlauf.length > 1).slice(0, 4));

  /** Normale Werte für die kompakte Ergebnissicht. */
  public readonly normaleWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status === 'normal'));

  /** Druckfertige Werte für die Ergebnistabelle. */
  public readonly druckWerte = computed(() => [...this.freigegebeneWerte().filter((wert: BerichtLaborwert) => wert.status !== 'normal'), ...this.normaleWerte()]);

  /** Gibt an, ob es druckbare Empfehlungen gibt. */
  public readonly hatEmpfehlungen = computed(() => this.bericht().empfehlungen.length > 0);

  /** Druckwert-Seiten, damit keine Wertkarten abgeschnitten werden. */
  public readonly druckWertSeiten = computed(() => this.chunk(this.druckWerte(), 10));

  /** Gibt an, ob der Bericht gedruckt werden darf. */
  public readonly druckFreigegeben = computed(() => !!this.patient() && !!this.befund() && !!this.bericht().disclaimer && this.offeneReviewAnzahl() === 0 && this.bericht().istDruckbar !== false);

  /** Gibt an, ob Fragen für das Arztgespräch vorhanden sind. */
  public readonly hatFragen = computed(() => this.bericht().fragen.length > 0);

  /** Quellenseiten, damit Quellen nicht abgeschnitten werden. */
  public readonly quellenSeiten = computed(() => this.chunk(this.bericht().quellen, 10, false));

  /** Gibt an, ob eine Fallback-Abschlussseite benötigt wird. */
  public readonly hatAbschlussFallback = computed(() => !this.hatFragen() && this.quellenSeiten().length === 0);

  /** Anzahl sichtbarer Druckseiten. */
  public readonly gesamtSeiten = computed(() => 1 + (this.hatEmpfehlungen() ? 1 : 0) + this.druckWertSeiten().length + (this.hatFragen() ? 1 : 0) + this.quellenSeiten().length + (this.hatAbschlussFallback() ? 1 : 0));

  /** Prüfpunkte vor Druck oder Export. */
  public readonly freigabeChecks = computed(() => [
    { key: 'patient', label: 'Patient gewählt', ok: !!this.patient(), details: [] as BerichtPruefEintrag[] },
    { key: 'befund', label: 'Befund gewählt', ok: !!this.befund(), details: [] as BerichtPruefEintrag[] },
    { key: 'review', label: 'Keine offenen Reviewwerte im Druck', ok: this.offeneReviewAnzahl() === 0, details: this.offeneReviewEintraege() },
    { key: 'wissen', label: 'Wissensbasis-Texte vorhanden', ok: this.fehlendeWissensbasisTexte().length === 0, details: this.fehlendeWissensbasisTexte() },
    { key: 'disclaimer', label: 'Disclaimer vorhanden', ok: !!this.bericht().disclaimer, details: [] as BerichtPruefEintrag[] }
  ]);

  /** Öffnet oder schließt die Liste fehlender Wissensbasis-Texte. */
  public wissensbasisDetailsUmschalten(): void {
    if (!this.fehlendeWissensbasisTexte().length) {
      return;
    }

    this.wissensbasisDetailsOffen.update((wert: boolean) => !wert);
  }

  /** Öffnet den nativen Druckdialog, wenn der Bericht druckfähig ist. */
  public drucken(): void {
    if (this.offeneReviewAnzahl() > 0 || this.bericht().istDruckbar === false) {
      this.toastService.zeige('Druck blockiert', 'Offene Reviewwerte müssen vor dem finalen Patientenbericht freigegeben oder entfernt werden.', 'warning');
      return;
    }

    if (this.fehlendeWissensbasisTexte().length > 0) {
      this.toastService.zeige('Wissensbasis unvollständig', `${this.fehlendeWissensbasisTexte().length} Patiententexte fehlen noch.`, 'warning');
    }

    window.print();
  }

  /** Berechnet das Alter am Berichtstag. */
  public alter(patient: Patient): number {
    const geburtsdatum = new Date(patient.geburtsdatum);
    const referenzdatum = new Date('2026-06-12');
    const alter = referenzdatum.getFullYear() - geburtsdatum.getFullYear();
    const hatteGeburtstag = referenzdatum.getMonth() > geburtsdatum.getMonth() || (referenzdatum.getMonth() === geburtsdatum.getMonth() && referenzdatum.getDate() >= geburtsdatum.getDate());
    return hatteGeburtstag ? alter : alter - 1;
  }

  /** Berechnet den BMI ohne medizinische Einordnung. */
  public bmi(patient: Patient): string {
    if (!patient.gewichtKg || !patient.groesseCm) {
      return 'nicht angegeben';
    }

    const groesseMeter = patient.groesseCm / 100;
    return (patient.gewichtKg / (groesseMeter * groesseMeter)).toFixed(1).replace('.', ',');
  }

  /** Gibt ein lesbares Statuslabel zurück. */
  public statusLabel(status: BerichtWertStatus): string {
    const labels: Record<BerichtWertStatus, string> = {
      normal: 'UNAUFFÄLLIG',
      niedrig: 'NIEDRIG',
      hoch: 'ERHÖHT',
      review: 'PRÜFEN'
    };

    return labels[status];
  }

  /** Gibt eine Statusklasse zurück. */
  public statusKlasse(status: BerichtWertStatus): string {
    return `is-${status}`;
  }

  /** Berechnet die Markerposition im Referenzbalken. */
  public markerPosition(wert: BerichtLaborwert): number {
    const min = Math.min(wert.referenzMin, wert.wert);
    const max = Math.max(wert.referenzMax, wert.wert);
    const spannweite = Math.max(max - min, 1);
    return this.begrenzen(((wert.wert - min) / spannweite) * 100, 4, 96);
  }

  /** Berechnet die Position des Referenzstarts. */
  public referenzStart(wert: BerichtLaborwert): number {
    const min = Math.min(wert.referenzMin, wert.wert);
    const max = Math.max(wert.referenzMax, wert.wert);
    const spannweite = Math.max(max - min, 1);
    return this.begrenzen(((wert.referenzMin - min) / spannweite) * 100, 0, 100);
  }

  /** Berechnet die Breite des Referenzbereichs. */
  public referenzBreite(wert: BerichtLaborwert): number {
    const min = Math.min(wert.referenzMin, wert.wert);
    const max = Math.max(wert.referenzMax, wert.wert);
    const spannweite = Math.max(max - min, 1);
    return this.begrenzen(((wert.referenzMax - wert.referenzMin) / spannweite) * 100, 8, 100);
  }

  /** Baut SVG-Punkte für eine Verlaufslinie. */
  public sparklinePunkte(wert: BerichtLaborwert): string {
    const werte = wert.verlauf.length ? wert.verlauf : [wert.wert];
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    const spannweite = Math.max(max - min, 1);
    return werte.map((punkt: number, index: number) => {
      const x = werte.length === 1 ? 50 : (index / Math.max(werte.length - 1, 1)) * 100;
      const y = 34 - ((punkt - min) / spannweite) * 28;
      return `${x.toFixed(1)},${this.begrenzen(y, 4, 34).toFixed(1)}`;
    }).join(' ');
  }

  /** Berechnet die Gesamtzahl einer Kategorie. */
  public kategorieGesamt(kategorie: { normal: number; auffaellig: number; review: number }): number {
    return kategorie.normal + kategorie.auffaellig + kategorie.review;
  }

  /** Berechnet den Prozentanteil einer Kategorie. */
  public kategorieAnteil(teil: number, gesamt: number): number {
    return gesamt > 0 ? (teil / gesamt) * 100 : 0;
  }

  /** Liefert einen fallback-sicheren Befundnamen. */
  public befundName(befund: PatientBefund | null): string {
    return befund?.name ?? 'kein Befund gewählt';
  }

  /** Liefert einen lesbaren Seitenzähler. */
  public seiteLabel(index: number): string {
    return `Seite ${index} / ${this.gesamtSeiten()}`;
  }

  /** Berechnet die Seitennummer der Ergebnisseite. */
  public ergebnisSeite(index: number): number {
    return 2 + (this.hatEmpfehlungen() ? 1 : 0) + index;
  }

  /** Berechnet die Seitennummer der Fragenseite. */
  public fragenSeite(): number {
    return 2 + (this.hatEmpfehlungen() ? 1 : 0) + this.druckWertSeiten().length;
  }

  /** Berechnet die Seitennummer einer Quellenseite. */
  public quellenSeitennummer(index: number): number {
    return this.fragenSeite() + (this.hatFragen() ? 1 : 0) + index;
  }

  /** Berechnet die Gesamtzahl aller Berichtswerte. */
  public gesamtWerte(): number {
    return this.bericht().gesamtWerte ?? this.bericht().werte.length;
  }

  /** Lädt den Bericht passend zum aktiven Kontext. */
  private berichtLaden(befundId?: string, patientId?: string): void {
    if (!befundId && !patientId) {
      return;
    }

    this.globiFlowApi.ladeBericht(befundId, patientId).subscribe((bericht: BerichtViewModel) => {
      this.bericht.set(bericht);
      this.wissensbasisDetailsOffen.set(false);
    });
  }

  /** Teilt ein Array in feste Seitengruppen. */
  private chunk<T>(werte: T[], groesse: number, leereSeite = true): T[][] {
    const seiten: T[][] = [];
    for (let index = 0; index < werte.length; index += groesse) {
      seiten.push(werte.slice(index, index + groesse));
    }
    return seiten.length ? seiten : leereSeite ? [[]] : [];
  }

  /** Begrenzt eine Zahl auf ein Minimum und Maximum. */
  private begrenzen(wert: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, wert));
  }
}
