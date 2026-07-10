/* src/app/pages/wissensbasis-page/wissensbasis-page-zustand.ts */

/**
 * @file Gemeinsamer Zustand und formularnahe Steuerung der Wissensbasis.
 * @module WissensbasisPageZustand
 */

import { Directive, OnDestroy, WritableSignal, computed, inject, signal } from '@angular/core';
import { Wissenseintrag, Wissensquelle, WissensquelleTyp } from '../../core/models/wissenseintrag.model';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';
import { bereinigeSichereEingabe } from '../../core/security/sichere-eingabe.util';
import { ToastService } from '../../shared/services/toast.service';
import { WissensStatusFilter, Wissensformular, eintragPasst, formularAusEintrag, normalisiereFarbeingabe, normalisiereQuellenStand, qualitaetsChecks, quellenIdentitaetsSchluessel, quellenSuchtext, quellenVorschlagSortierung, statusKlasse, statusLabel, verfuegbareKategorienErmitteln, wissenseintragNormalisieren } from './wissensbasis-page-logik';

/** Fallback-Eintrag, bis die Wissensbasis aus der API geladen wurde. */
export const LEERER_WISSENSEINTRAG: Wissenseintrag = {
  id: '',
  laborwertKey: '',
  anzeigename: 'Daten werden geladen',
  kategorie: 'Wissensbasis',
  farbe: '#0f5297',
  patientKurztext: '',
  patientLangtext: '',
  arztinformation: '',
  ursachenNiedrig: '',
  ursachenHoch: '',
  einflussfaktoren: '',
  hinweise: '',
  disclaimer: 'Diese Erklärung ersetzt keine ärztliche Diagnose oder Behandlung.',
  quellen: [],
  version: 1,
  status: 'entwurf',
  geaendertAm: '',
  geaendertVon: 'System',
  versionen: []
};

/**
 * Hält den gemeinsamen Seitenzustand sowie Filter- und Formulareingaben.
 */
@Directive()
export abstract class WissensbasisPageZustand implements OnDestroy {
  protected readonly toastService = inject(ToastService);                                                           // Toast-Service für Statusrückmeldungen.
  protected readonly globiFlowApi = inject(GlobiFlowApiService);                                                    // API-Service für Wissenseinträge.
  public readonly wissenseintraege: WritableSignal<Wissenseintrag[]> = signal([LEERER_WISSENSEINTRAG]);           // Wissenseinträge aus der Backend-API.
  public readonly aktiverEintragId: WritableSignal<string> = signal('');                                          // Aktive Wissens-ID.
  public readonly suche: WritableSignal<string> = signal('');                                                     // Suchbegriff.
  public readonly statusFilter: WritableSignal<WissensStatusFilter> = signal('alle');                             // Statusfilter.
  public readonly kategorieFilter: WritableSignal<string> = signal('alle');                                       // Kategorienfilter.
  public readonly quellenindexOffen: WritableSignal<boolean> = signal(false);                                     // Sichtbarkeit des Quellenindex.
  public readonly anlageModalOffen: WritableSignal<boolean> = signal(false);                                      // Sichtbarkeit des Anlage-Modals.
  public readonly loeschDialogId: WritableSignal<string> = signal('');                                            // ID des Eintrags, dessen Löschung bestätigt werden muss.
  public readonly neuerLaborwertKey: WritableSignal<string> = signal('');                                         // Neuer Laborwert-Key für das Anlage-Modal.
  public readonly neuerAnzeigename: WritableSignal<string> = signal('');                                          // Neuer Anzeigename für das Anlage-Modal.
  public readonly neueKategorie: WritableSignal<string> = signal('');                                             // Neue Kategorie für das Anlage-Modal.
  public readonly neueKategorieEingabeAktiv: WritableSignal<boolean> = signal(false);                             // Gibt an, ob die Kategorieeingabe im Anlageformular aktiv ist.
  public readonly formular: WritableSignal<Wissensformular> = signal(formularAusEintrag(LEERER_WISSENSEINTRAG));  // Editorformular.
  public readonly bearbeitungsmodusAktiv: WritableSignal<boolean> = signal(false);                                // Gibt an, ob der aktive Eintrag bearbeitet werden darf.
  public readonly quellenTitel: WritableSignal<string> = signal('');                                              // Eingabe Quellentitel.
  public readonly quellenTyp: WritableSignal<WissensquelleTyp> = signal('demo');                                  // Eingabe Quellenart.
  public readonly quellenStand: WritableSignal<string> = signal('');                                              // Eingabe Quellenstand.
  public readonly quellenReferenz: WritableSignal<string> = signal('');                                           // Eingabe Quellenreferenz.
  public readonly quellenHinweis: WritableSignal<string> = signal('');                                            // Eingabe Quellenhinweis.
  public readonly quellenVorschlaegeOffen: WritableSignal<boolean> = signal(false);                               // Sichtbarkeit der vorhandenen Quellenvorschläge.
  public readonly quellenTypDropdownOffen: WritableSignal<boolean> = signal(false);                               // Sichtbarkeit der Quellenart-Auswahl.
  public readonly resetDialogOffen: WritableSignal<boolean> = signal(false);                                      // Sichtbarkeit des Wissensbasis-Resetdialogs.
  public readonly resetLaeuft: WritableSignal<boolean> = signal(false);                                           // Gibt an, ob der Wissensbasis-Reset gerade läuft.
  protected kategorieBlurTimerId: ReturnType<typeof setTimeout> | null = null;                                      // Timer zum verzögerten Deaktivieren der Kategoriepills.


  /** Statusfilteroptionen. */
  public readonly statusOptionen: { key: WissensStatusFilter; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'entwurf', label: 'Entwurf' },
    { key: 'pruefung', label: 'Prüfung' },
    { key: 'freigegeben', label: 'Freigegeben' }
  ];

  /** Quellenarten. */
  public readonly quellenTypen: { key: WissensquelleTyp; label: string }[] = [
    { key: 'demo', label: 'Demo' },
    { key: 'intern', label: 'Intern' },
    { key: 'laborlexikon', label: 'Laborlexikon' },
    { key: 'leitlinie', label: 'Leitlinie' },
    { key: 'fachliteratur', label: 'Fachliteratur' }
  ];

  /**
   * Lädt die Wissensbasis aus der API.
   */
  public constructor() {
    this.globiFlowApi.ladeWissenseintraege().subscribe((eintraege: Wissenseintrag[]) => {
      const daten = eintraege.length ? eintraege.map((eintrag: Wissenseintrag) => wissenseintragNormalisieren(eintrag)) : [LEERER_WISSENSEINTRAG];
      this.wissenseintraege.set(daten);
      this.eintragAuswaehlen(daten[0]);
    });
  }

  /**
   * Räumt verzögerte Kategorieaktionen auf.
   */
  public ngOnDestroy(): void {
    if (this.kategorieBlurTimerId) {
      clearTimeout(this.kategorieBlurTimerId);
    }
  }

  public readonly verfuegbareKategorien = computed(() => verfuegbareKategorienErmitteln(this.wissenseintraege()));  // Vorhandene Kategorien für Anlageformular und neue Wissenskarten.
  public readonly kategorien = computed(() => ['alle', ...this.verfuegbareKategorien()]);                                                                                                                                                    // Kategorien der vorhandenen Einträge.
  public readonly sichtbareEintraege = computed(() => this.wissenseintraege().filter((eintrag: Wissenseintrag) => eintragPasst(eintrag, this.suche(), this.statusFilter(), this.kategorieFilter())));                                                                                              // Gefilterte Wissenseinträge.


  /** Quellenindex über alle Einträge. */
  public readonly quellenindex = computed(() => {
    const quellen = this.wissenseintraege().flatMap((eintrag: Wissenseintrag) => eintrag.quellen.map((quelle: Wissensquelle) => ({ ...quelle, eintrag: eintrag.anzeigename, laborwertKey: eintrag.laborwertKey })));
    return quellen.sort((a, b) => a.titel.localeCompare(b.titel));
  });

  /** Eindeutige Quellen aus allen Wissenskarten für die Schnellauswahl. */
  public readonly verfuegbareQuellen = computed(() => {
    const quellenMap = new Map<string, Wissensquelle>();

    for (const eintrag of this.wissenseintraege()) {
      for (const quelle of eintrag.quellen) {
        const schluessel = quellenIdentitaetsSchluessel(quelle);

        if (schluessel && !quellenMap.has(schluessel)) {
          quellenMap.set(schluessel, quelle);
        }
      }
    }

    return Array.from(quellenMap.values()).sort((a, b) => a.titel.localeCompare(b.titel));
  });

  /** Gefilterte Quellenvorschläge für die aktuelle Eingabe. */
  public readonly quellenVorschlaege = computed(() => {
    const suche = this.quellenTitel().trim().toLowerCase();

    return this.verfuegbareQuellen()
      .filter((quelle: Wissensquelle) => !suche || quellenSuchtext(quelle).includes(suche))
      .sort((a: Wissensquelle, b: Wissensquelle) => quellenVorschlagSortierung(a, b, suche))
      .slice(0, 18);
  });

  /**
   * Aktiver Wissenseintrag.
   *
   * @returns Aktiver Wissenseintrag oder definierter Fallback.
   */
  public aktiverEintrag(): Wissenseintrag {
    return this.wissenseintraege().find((eintrag: Wissenseintrag) => eintrag.id === this.aktiverEintragId()) ?? this.wissenseintraege()[0] ?? LEERER_WISSENSEINTRAG;
  }

  /**
   * Eintrag im Löschdialog.
   *
   * @returns Eintrag des Löschdialogs oder `null`.
   */
  public loeschDialogEintrag(): Wissenseintrag | null {
    return this.wissenseintraege().find((eintrag: Wissenseintrag) => eintrag.id === this.loeschDialogId()) ?? null;
  }

  /**
   * Berechnet Kennzahlen für die Wissensbasis.
   *
   * @param status Neuer oder zu filternder Wissensstatus.
   * @returns Berechneter Kennzahlenwert.
   */
  public kennzahl(status: WissensStatusFilter): number {
    if (status === 'alle') {
      return this.wissenseintraege().length;
    }

    return this.wissenseintraege().filter((eintrag: Wissenseintrag) => eintrag.status === status).length;
  }

  /**
   * Zählt Einträge mit Qualitätsproblemen.
   *
   * @returns Berechneter Kennzahlenwert.
   */
  public qualitaetsprobleme(): number {
    return this.wissenseintraege().filter((eintrag: Wissenseintrag) => qualitaetsChecks(eintrag).some((check) => !check.ok)).length;
  }

  /**
   * Setzt den aktiven Eintrag.
   *
   * @param eintrag Ausgewählter oder zu verarbeitender Wissenseintrag.
   */
  public eintragAuswaehlen(eintrag: Wissenseintrag): void {
    this.aktiverEintragId.set(eintrag.id);
    this.formular.set(formularAusEintrag(eintrag));
    this.bearbeitungsmodusAktiv.set(false);
  }

  /**
   * Öffnet einen Wissenseintrag direkt im Bearbeitungsmodus.
   *
   * @param eintrag Zu bearbeitender Wissenseintrag.
   */
  public eintragBearbeiten(eintrag: Wissenseintrag): void {
    this.eintragAuswaehlen(eintrag);
    this.bearbeitungsmodusAktiv.set(true);
  }

  /**
   * Schaltet zwischen Lese- und Bearbeitungsmodus um.
   *
   * Beim Abbrechen werden ungespeicherte Formularänderungen verworfen.
   */
  public bearbeitungsmodusUmschalten(): void {
    if (this.bearbeitungsmodusAktiv()) {
      this.formular.set(formularAusEintrag(this.aktiverEintrag()));
      this.bearbeitungsmodusAktiv.set(false);
      return;
    }

    this.bearbeitungsmodusAktiv.set(true);
  }

  public kategorieEingabeAktivSetzen(aktiv: boolean): void {
    if (this.kategorieBlurTimerId) {
      clearTimeout(this.kategorieBlurTimerId);
    }

    this.neueKategorieEingabeAktiv.set(aktiv);
  }

  /**
   * Deaktiviert Kategoriepills verzögert, damit Pill-Klicks noch ausgeführt werden.
   */
  public kategorieEingabeVerzoegertDeaktivieren(): void {
    if (this.kategorieBlurTimerId) {
      clearTimeout(this.kategorieBlurTimerId);
    }

    this.kategorieBlurTimerId = setTimeout(() => this.neueKategorieEingabeAktiv.set(false), 140);
  }

  /**
   * Übernimmt eine vorhandene Kategorie exakt in das Anlageformular.
   *
   * @param kategorie Ausgewählte oder zu filternde Kategorie.
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */
  public kategorieAuswaehlen(kategorie: string, event?: Event): void {
    event?.preventDefault();
    this.neueKategorie.set(kategorie);
    this.neueKategorieEingabeAktiv.set(true);
  }

  /**
   * Normalisiert das Quellenstandsdatum im Formular.
   */
  public quellenStandNormalisieren(): void {
    this.quellenStand.set(normalisiereQuellenStand(this.quellenStand()));
  }

  /**
   * Aktualisiert die Suche über die zentrale Suchkomponente.
   *
   * @param wert Bereinigter Eingabewert.
   */
  public sucheSetzen(wert: string): void {
    this.suche.set(wert);
  }

  /**
   * Aktualisiert ein Anlagefeld.
   *
   * @param feld Zu aktualisierendes Formularfeld.
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */
  public anlageFeldSetzen(feld: 'laborwertKey' | 'anzeigename' | 'kategorie', event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const typ = feld === 'laborwertKey' ? 'schluessel' : 'name';
    const wert = bereinigeSichereEingabe(eingabe.value, typ, 80);

    if (feld === 'laborwertKey') {
      this.neuerLaborwertKey.set(wert);
    } else if (feld === 'anzeigename') {
      this.neuerAnzeigename.set(wert);
    } else {
      this.neueKategorie.set(wert);
    }
  }

  /**
   * Setzt den Statusfilter.
   *
   * @param status Neuer oder zu filternder Wissensstatus.
   */
  public statusFilterSetzen(status: WissensStatusFilter): void {
    this.statusFilter.set(status);
  }

  /**
   * Setzt den Kategorienfilter.
   *
   * @param kategorie Ausgewählte oder zu filternde Kategorie.
   */
  public kategorieFilterSetzen(kategorie: string): void {
    this.kategorieFilter.set(kategorie);
  }

  /**
   * Aktualisiert ein Formularfeld.
   *
   * @param feld Zu aktualisierendes Formularfeld.
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */
  public formularfeldSetzen(feld: keyof Wissensformular, event: Event): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    const eingabe = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const maxLaenge = feld === 'patientKurztext' ? 500 : feld === 'laborwertKey' || feld === 'anzeigename' || feld === 'kategorie' ? 100 : 4000;
    const typ = feld === 'laborwertKey' ? 'schluessel' : feld === 'anzeigename' || feld === 'kategorie' ? 'name' : 'freitext';
    const wert = feld === 'farbe' ? eingabe.value : bereinigeSichereEingabe(eingabe.value, typ, maxLaenge);
    const formularwert = feld === 'farbe' ? normalisiereFarbeingabe(wert) : wert;

    this.formular.update((formular: Wissensformular) => ({ ...formular, [feld]: formularwert }));
  }

  /**
   * Aktualisiert die Quellenart.
   *
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */

  public readonly statusKlasse = statusKlasse;

  /** Liefert das lesbare Label eines Wissensstatus. */
  public readonly statusLabel = statusLabel;

  /** Prüft die Mindestinhalte eines Wissenseintrags. */
  public readonly qualitaetsChecks = qualitaetsChecks;
}
