/* src/app/pages/berichte-page/berichte-page.component.ts */

/**
 * @file Routenseite für druckfertige DIN-A4-Patientenberichte.
 * @module BerichtePageComponent
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { MOCK_BERICHT } from '../../core/mocks/berichte.mock';
import { BerichtLaborwert, BerichtViewModel, BerichtWertStatus } from '../../core/models/bericht.model';
import { Patient, PatientBefund } from '../../core/models/patient.model';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ToastService } from '../../shared/services/toast.service';

/** Route `/berichte` für Berichtsvorschau und Printansicht. */
@Component({
  selector: 'dd-berichte-page',
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

  /** Druckfertiger Mockbericht bis zur API-Anbindung. */
  public readonly bericht = signal<BerichtViewModel>(MOCK_BERICHT);

  /** Aktiver Patient. */
  public readonly patient = computed(() => this.patientContext.aktiverPatient());

  /** Aktiver Befund. */
  public readonly befund = computed(() => this.patientContext.aktiverBefund());

  /** Auffällige oder prüfpflichtige Werte für die interne Kurzsicht. */
  public readonly auffaelligeWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status !== 'normal'));

  /** Noch nicht druckfreigegebene Werte. */
  public readonly offenePruefwerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status === 'review'));

  /** Druckfähige Werte ohne offene Reviewwerte. */
  public readonly freigegebeneWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status !== 'review'));

  /** Auffällige druckfähige Werte für Verlaufsgrafiken. */
  public readonly trendWerte = computed(() => this.freigegebeneWerte().filter((wert: BerichtLaborwert) => wert.status !== 'normal'));

  /** Normale Werte für die kompakte Ergebnissicht. */
  public readonly normaleWerte = computed(() => this.bericht().werte.filter((wert: BerichtLaborwert) => wert.status === 'normal'));

  /** Druckfertige Werte für die Ergebnistabelle. */
  public readonly druckWerte = computed(() => [...this.freigegebeneWerte().filter((wert: BerichtLaborwert) => wert.status !== 'normal'), ...this.normaleWerte()].slice(0, 10));

  /** Prüfpunkte vor Druck oder Export. */
  public readonly freigabeChecks = computed(() => [
    { label: 'Patient gewählt', ok: !!this.patient() },
    { label: 'Befund gewählt', ok: !!this.befund() },
    { label: 'Keine offenen Reviewwerte im Druck', ok: this.offenePruefwerte().length === 0 },
    { label: 'Wissensbasis-Texte vorhanden', ok: this.bericht().werte.every((wert: BerichtLaborwert) => !!wert.erklaerung) },
    { label: 'Disclaimer vorhanden', ok: !!this.bericht().disclaimer }
  ]);

  /** Öffnet den nativen Druckdialog, wenn der Bericht druckfähig ist. */
  public drucken(): void {
    if (this.offenePruefwerte().length > 0) {
      this.toastService.zeige('Druck blockiert', 'Offene Reviewwerte müssen vor dem finalen Patientenbericht freigegeben oder entfernt werden.', 'warning');
      return;
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
    const werte = wert.verlauf;
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    const spannweite = Math.max(max - min, 1);
    return werte.map((punkt: number, index: number) => {
      const x = (index / Math.max(werte.length - 1, 1)) * 100;
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

  /** Begrenzt eine Zahl auf ein Minimum und Maximum. */
  private begrenzen(wert: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, wert));
  }
}
