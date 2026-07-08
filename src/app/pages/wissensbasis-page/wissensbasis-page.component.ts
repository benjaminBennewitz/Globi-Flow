/* src/app/pages/wissensbasis-page/wissensbasis-page.component.ts */

/**
 * @file Routenseite für kontrollierte Wissensbasis mit Editor und Quellenindex.
 * @module WissensbasisPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { Wissenseintrag, WissenseintragStatus, Wissensquelle, WissensquelleTyp } from '../../core/models/wissenseintrag.model';
import { IconActionComponent } from '../../shared/components/icon-action/icon-action.component';
import { SecureSearchComponent } from '../../shared/components/secure-search/secure-search.component';
import { ToastService } from '../../shared/services/toast.service';
import { GlobiFlowApiService } from '../../core/services/globi-flow-api.service';

/** Filteroption für Wissenseinträge. */
type WissensStatusFilter = WissenseintragStatus | 'alle';

/** Formularzustand für Wissenseinträge. */
interface Wissensformular {
  /** Eindeutige Wissens-ID. */
  id: string;

  /** Laborwert-Key. */
  laborwertKey: string;

  /** Anzeigename. */
  anzeigename: string;

  /** Kategorie. */
  kategorie: string;

  /** Kurze Patientenerklärung. */
  patientKurztext: string;

  /** Ausführliche Patientenerklärung. */
  patientLangtext: string;

  /** Arztinformation. */
  arztinformation: string;

  /** Ursachen bei niedrigen Werten. */
  ursachenNiedrig: string;

  /** Ursachen bei hohen Werten. */
  ursachenHoch: string;

  /** Einflussfaktoren. */
  einflussfaktoren: string;

  /** Hinweise. */
  hinweise: string;

  /** Disclaimer. */
  disclaimer: string;

  /** Version. */
  version: number;

  /** Status. */
  status: WissenseintragStatus;

  /** Quellen. */
  quellen: Wissensquelle[];

  /** Änderungsnotiz. */
  aenderungsnotiz: string;
}


/** Fallback-Eintrag, bis die Wissensbasis aus der API geladen wurde. */
const LEERER_WISSENSEINTRAG: Wissenseintrag = {
  id: '',
  laborwertKey: '',
  anzeigename: 'Daten werden geladen',
  kategorie: 'Wissensbasis',
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

/** Route `/wissensbasis` für kontrollierte Erklärungstexte. */
@Component({
  selector: 'gf-wissensbasis-page',
  imports: [IconActionComponent, SecureSearchComponent],
  templateUrl: './wissensbasis-page.component.html',
  styleUrl: './wissensbasis-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WissensbasisPageComponent {
  /** Toast-Service für Statusrückmeldungen. */
  private readonly toastService = inject(ToastService);

  /** API-Service für Wissenseinträge. */
  private readonly globiFlowApi = inject(GlobiFlowApiService);

  /** Wissenseinträge aus der Backend-API. */
  public readonly wissenseintraege: WritableSignal<Wissenseintrag[]> = signal([LEERER_WISSENSEINTRAG]);

  /** Aktive Wissens-ID. */
  public readonly aktiverEintragId: WritableSignal<string> = signal('');

  /** Suchbegriff. */
  public readonly suche: WritableSignal<string> = signal('');

  /** Statusfilter. */
  public readonly statusFilter: WritableSignal<WissensStatusFilter> = signal('alle');

  /** Kategorienfilter. */
  public readonly kategorieFilter: WritableSignal<string> = signal('alle');

  /** Sichtbarkeit des Quellenindex. */
  public readonly quellenindexOffen: WritableSignal<boolean> = signal(false);

  /** Sichtbarkeit des Anlage-Modals. */
  public readonly anlageModalOffen: WritableSignal<boolean> = signal(false);

  /** ID des Eintrags, dessen Löschung bestätigt werden muss. */
  public readonly loeschDialogId: WritableSignal<string> = signal('');

  /** Neuer Laborwert-Key für das Anlage-Modal. */
  public readonly neuerLaborwertKey: WritableSignal<string> = signal('');

  /** Neuer Anzeigename für das Anlage-Modal. */
  public readonly neuerAnzeigename: WritableSignal<string> = signal('');

  /** Neue Kategorie für das Anlage-Modal. */
  public readonly neueKategorie: WritableSignal<string> = signal('');

  /** Editorformular. */
  public readonly formular: WritableSignal<Wissensformular> = signal(this.formularAusEintrag(LEERER_WISSENSEINTRAG));

  /** Eingabe Quellentitel. */
  public readonly quellenTitel: WritableSignal<string> = signal('');

  /** Eingabe Quellenart. */
  public readonly quellenTyp: WritableSignal<WissensquelleTyp> = signal('demo');

  /** Eingabe Quellenstand. */
  public readonly quellenStand: WritableSignal<string> = signal('');

  /** Eingabe Quellenreferenz. */
  public readonly quellenReferenz: WritableSignal<string> = signal('');

  /** Eingabe Quellenhinweis. */
  public readonly quellenHinweis: WritableSignal<string> = signal('');

  /** Sichtbarkeit der vorhandenen Quellenvorschläge. */
  public readonly quellenVorschlaegeOffen: WritableSignal<boolean> = signal(false);

  /** Sichtbarkeit der Quellenart-Auswahl. */
  public readonly quellenTypDropdownOffen: WritableSignal<boolean> = signal(false);

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

  /** Lädt die Wissensbasis aus der API. */
  public constructor() {
    this.globiFlowApi.ladeWissenseintraege().subscribe((eintraege: Wissenseintrag[]) => {
      const daten = eintraege.length ? eintraege : [LEERER_WISSENSEINTRAG];
      this.wissenseintraege.set(daten);
      this.eintragAuswaehlen(daten[0]);
    });
  }

  /** Kategorien der vorhandenen Einträge. */
  public readonly kategorien = computed(() => ['alle', ...Array.from(new Set(this.wissenseintraege().map((eintrag: Wissenseintrag) => eintrag.kategorie)))]);

  /** Gefilterte Wissenseinträge. */
  public readonly sichtbareEintraege = computed(() => this.wissenseintraege().filter((eintrag: Wissenseintrag) => this.eintragPasst(eintrag)));

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
        const schluessel = this.quellenIdentitaetsSchluessel(quelle);

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
      .filter((quelle: Wissensquelle) => !suche || this.quellenSuchtext(quelle).includes(suche))
      .sort((a: Wissensquelle, b: Wissensquelle) => this.quellenVorschlagSortierung(a, b, suche))
      .slice(0, 18);
  });

  /** Aktiver Wissenseintrag. */
  public aktiverEintrag(): Wissenseintrag {
    return this.wissenseintraege().find((eintrag: Wissenseintrag) => eintrag.id === this.aktiverEintragId()) ?? this.wissenseintraege()[0] ?? LEERER_WISSENSEINTRAG;
  }

  /** Eintrag im Löschdialog. */
  public loeschDialogEintrag(): Wissenseintrag | null {
    return this.wissenseintraege().find((eintrag: Wissenseintrag) => eintrag.id === this.loeschDialogId()) ?? null;
  }

  /** Berechnet Kennzahlen für die Wissensbasis. */
  public kennzahl(status: WissensStatusFilter): number {
    if (status === 'alle') {
      return this.wissenseintraege().length;
    }

    return this.wissenseintraege().filter((eintrag: Wissenseintrag) => eintrag.status === status).length;
  }

  /** Zählt Einträge mit Qualitätsproblemen. */
  public qualitaetsprobleme(): number {
    return this.wissenseintraege().filter((eintrag: Wissenseintrag) => this.qualitaetsChecks(eintrag).some((check) => !check.ok)).length;
  }

  /** Setzt den aktiven Eintrag. */
  public eintragAuswaehlen(eintrag: Wissenseintrag): void {
    this.aktiverEintragId.set(eintrag.id);
    this.formular.set(this.formularAusEintrag(eintrag));
  }

  /** Öffnet das Anlage-Modal. */
  public anlageModalOeffnen(): void {
    this.anlageModalOffen.set(true);
  }

  /** Schließt das Anlage-Modal. */
  public anlageModalSchliessen(): void {
    this.anlageModalOffen.set(false);
  }

  /** Öffnet den Löschdialog. */
  public loeschDialogOeffnen(id: string): void {
    this.loeschDialogId.set(id);
  }

  /** Schließt den Löschdialog. */
  public loeschDialogSchliessen(): void {
    this.loeschDialogId.set('');
  }

  /** Erstellt einen neuen Entwurf und öffnet ihn im Editor. */
  public eintragAnlegen(): void {
    const laborwertKey = this.neuerLaborwertKey().trim() || 'neuer_laborwert';
    const anzeigename = this.neuerAnzeigename().trim() || 'Neuer Laborwert';
    const kategorie = this.neueKategorie().trim() || 'Neue Kategorie';
    const eintrag: Partial<Wissenseintrag> = {
      laborwertKey,
      anzeigename,
      kategorie,
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
      geaendertAm: this.heutigesDatumLabel(),
      geaendertVon: 'Admin',
      versionen: [{ version: 1, datum: this.heutigesDatumLabel(), bearbeitetVon: 'Admin', notiz: 'Neuer Entwurf angelegt.' }]
    };

    this.globiFlowApi.wissenseintragAnlegen(eintrag).subscribe({
      next: (antwort: Wissenseintrag) => {
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => [antwort, ...eintraege.filter((wert: Wissenseintrag) => wert.id && wert.id !== antwort.id)]);
        this.eintragAuswaehlen(antwort);
        this.neuerLaborwertKey.set('');
        this.neuerAnzeigename.set('');
        this.neueKategorie.set('');
        this.anlageModalSchliessen();
        this.toastService.zeige('Wissenskarte angelegt', `${antwort.anzeigename} wurde als Entwurf gespeichert.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Anlage fehlgeschlagen', 'Die Wissenskarte konnte nicht in der API angelegt werden.', 'danger');
      }
    });
  }

  /** Löscht den im Dialog gewählten Eintrag. */
  public eintragWirklichLoeschen(): void {
    const eintrag = this.loeschDialogEintrag();

    if (!eintrag) {
      return;
    }

    this.globiFlowApi.wissenseintragLoeschen(eintrag).subscribe({
      next: () => {
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.filter((wert: Wissenseintrag) => wert.id !== eintrag.id));

        if (this.aktiverEintragId() === eintrag.id && this.wissenseintraege()[0]) {
          this.eintragAuswaehlen(this.wissenseintraege()[0]);
        }

        this.loeschDialogSchliessen();
        this.toastService.zeige('Wissenskarte gelöscht', `${eintrag.anzeigename} wurde aus der Datenbank entfernt.`, 'danger');
      },
      error: () => {
        this.toastService.zeige('Löschen fehlgeschlagen', `${eintrag.anzeigename} konnte nicht gelöscht werden.`, 'danger');
      }
    });
  }

  /** Setzt den Status eines Wissenseintrags lokal. */
  public eintragStatusSetzen(id: string, status: WissenseintragStatus): void {
    const eintrag = this.wissenseintraege().find((wert: Wissenseintrag) => wert.id === id);

    if (!eintrag) {
      return;
    }

    const aktualisiert: Wissenseintrag & { aenderungsnotiz?: string } = {
      ...eintrag,
      status,
      geaendertAm: this.heutigesDatumLabel(),
      geaendertVon: 'Admin',
      aenderungsnotiz: `Status auf ${status} gesetzt.`
    };

    this.globiFlowApi.wissenseintragSpeichern(aktualisiert, eintrag.laborwertKey).subscribe({
      next: (antwort: Wissenseintrag) => {
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((wert: Wissenseintrag) => wert.id === id ? antwort : wert));

        if (this.aktiverEintragId() === id) {
          this.formular.set(this.formularAusEintrag(antwort));
        }

        this.statusToast(antwort, status);
      },
      error: () => {
        this.toastService.zeige('Status nicht gespeichert', `${eintrag.anzeigename} konnte nicht aktualisiert werden.`, 'danger');
      }
    });
  }

  /** Öffnet den Löschdialog für den aktiven Eintrag. */
  public eintragLoeschen(): void {
    this.loeschDialogOeffnen(this.formular().id);
  }

  /** Speichert Formularwerte dauerhaft über die Backend-API. */
  public entwurfSpeichern(): void {
    const formular = this.formular();
    const eintrag = this.aktiverEintrag();
    const payload = this.formularZuEintrag(eintrag, formular);

    this.globiFlowApi.wissenseintragSpeichern(payload, eintrag.laborwertKey).subscribe({
      next: (antwort: Wissenseintrag) => {
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((wert: Wissenseintrag) => wert.id === formular.id ? antwort : wert));
        this.eintragAuswaehlen(antwort);
        this.toastService.zeige('Änderungen gespeichert', `${antwort.anzeigename} wurde in der Datenbank aktualisiert.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Speichern fehlgeschlagen', `${formular.anzeigename} konnte nicht aktualisiert werden.`, 'danger');
      }
    });
  }

  /** Setzt den Formularstatus ohne sofortige Speicherung. */
  public statusSetzen(status: WissenseintragStatus): void {
    this.formular.update((formular: Wissensformular) => ({ ...formular, status }));
  }

  /** Setzt den Formularstatus und speichert ihn direkt. */
  public statusSetzenUndSpeichern(status: WissenseintragStatus): void {
    this.statusSetzen(status);
    this.entwurfSpeichern();
  }

  /** Öffnet oder schließt den Quellenindex. */
  public quellenindexUmschalten(): void {
    this.quellenindexOffen.update((wert: boolean) => !wert);
  }

  /** Fügt eine Quelle zum aktiven Formular hinzu. */
  public quelleHinzufuegen(): void {
    const titel = this.quellenTitel().trim();

    if (!titel) {
      return;
    }

    const quellenEntwurf: Wissensquelle = {
      id: `quelle-local-${Date.now()}`,
      titel,
      typ: this.quellenTyp(),
      stand: this.quellenStand().trim() || 'ohne Stand',
      referenz: this.quellenReferenz().trim(),
      hinweis: this.quellenHinweis().trim()
    };
    const vorhandeneQuelle = this.passendeVorhandeneQuelleFinden(quellenEntwurf);
    const quelle: Wissensquelle = {
      id: vorhandeneQuelle?.id ?? quellenEntwurf.id,
      titel: vorhandeneQuelle?.titel ?? quellenEntwurf.titel,
      typ: vorhandeneQuelle?.typ ?? quellenEntwurf.typ,
      stand: quellenEntwurf.stand !== 'ohne Stand' ? quellenEntwurf.stand : vorhandeneQuelle?.stand ?? quellenEntwurf.stand,
      referenz: quellenEntwurf.referenz || vorhandeneQuelle?.referenz || '',
      hinweis: quellenEntwurf.hinweis || vorhandeneQuelle?.hinweis || ''
    };
    const aktuelleQuellen = this.formular().quellen;

    if (aktuelleQuellen.some((formularQuelle: Wissensquelle) => this.quellenIdentitaetsSchluessel(formularQuelle) === this.quellenIdentitaetsSchluessel(quelle))) {
      this.toastService.zeige('Quelle bereits zugeordnet', quelle.titel, 'warning');
      return;
    }

    const quellen = [...aktuelleQuellen, quelle];

    this.formular.update((formular: Wissensformular) => ({ ...formular, quellen }));
    this.formularQuellenInAktivemEintragSpiegeln(quellen);
    this.quellenTitel.set('');
    this.quellenStand.set('');
    this.quellenReferenz.set('');
    this.quellenHinweis.set('');
    this.quellenVorschlaegeOffen.set(false);
    this.toastService.zeige('Quelle hinzugefügt', quelle.titel, 'success');
  }

  /** Entfernt eine Quelle aus dem Formular. */
  public quelleEntfernen(id: string): void {
    const quellen = this.formular().quellen.filter((quelle: Wissensquelle) => quelle.id !== id);

    this.formular.update((formular: Wissensformular) => ({ ...formular, quellen }));
    this.formularQuellenInAktivemEintragSpiegeln(quellen);
    this.toastService.zeige('Quelle entfernt', 'Die Quelle wurde aus dem Formular entfernt.', 'warning');
  }

  /** Öffnet die Quellenvorschläge. */
  public quellenVorschlaegeOeffnen(): void {
    this.quellenVorschlaegeOffen.set(true);
  }

  /** Wählt eine vorhandene Quelle für das Quellenformular aus. */
  public quelleAuswaehlen(quelle: Wissensquelle, event?: Event): void {
    event?.preventDefault();
    this.quellenTitel.set(quelle.titel);
    this.quellenTyp.set(quelle.typ);
    this.quellenStand.set(quelle.stand);
    this.quellenReferenz.set(quelle.referenz);
    this.quellenHinweis.set(quelle.hinweis);
    this.quellenVorschlaegeOffen.set(false);
  }

  /** Prüft, ob eine Quelle dem aktuellen Formular bereits zugeordnet ist. */
  public quelleIstBereitsZugeordnet(quelle: Wissensquelle): boolean {
    return this.formular().quellen.some((formularQuelle: Wissensquelle) => this.quellenIdentitaetsSchluessel(formularQuelle) === this.quellenIdentitaetsSchluessel(quelle));
  }

  /** Liefert einen stabilen Track-Key für Quellenvorschläge. */
  public quellenTrackKey(quelle: Wissensquelle): string {
    return this.quellenIdentitaetsSchluessel(quelle);
  }

  /** Gibt das Label einer Quellenart zurück. */
  public quellenTypAnzeigename(typ: WissensquelleTyp): string {
    return this.quellenTypen.find((option) => option.key === typ)?.label ?? 'Demo';
  }

  /** Liefert die Metazeile eines Quellenvorschlags. */
  public quellenVorschlagMeta(quelle: Wissensquelle): string {
    const meta = [this.quellenTypAnzeigename(quelle.typ), quelle.stand, quelle.referenz].filter((wert: string) => !!wert.trim());

    if (this.quelleIstBereitsZugeordnet(quelle)) {
      meta.push('Bereits zugeordnet');
    }

    return meta.join(' · ');
  }

  /** Öffnet oder schließt die Quellenart-Auswahl. */
  public quellenTypDropdownUmschalten(): void {
    this.quellenTypDropdownOffen.update((offen: boolean) => !offen);
  }

  /** Setzt die Quellenart über die eigene Auswahl. */
  public quellenTypAuswaehlen(typ: WissensquelleTyp): void {
    this.quellenTyp.set(typ);
    this.quellenTypDropdownOffen.set(false);
  }

  /** Gibt das Label der aktuellen Quellenart zurück. */
  public quellenTypLabel(): string {
    return this.quellenTypen.find((typ) => typ.key === this.quellenTyp())?.label ?? 'Demo';
  }

  /** Aktualisiert die Suche über die zentrale Suchkomponente. */
  public sucheSetzen(wert: string): void {
    this.suche.set(wert);
  }

  /** Aktualisiert ein Anlagefeld. */
  public anlageFeldSetzen(feld: 'laborwertKey' | 'anzeigename' | 'kategorie', event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const wert = eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '').slice(0, 80);

    if (feld === 'laborwertKey') {
      this.neuerLaborwertKey.set(wert);
    } else if (feld === 'anzeigename') {
      this.neuerAnzeigename.set(wert);
    } else {
      this.neueKategorie.set(wert);
    }
  }

  /** Setzt den Statusfilter. */
  public statusFilterSetzen(status: WissensStatusFilter): void {
    this.statusFilter.set(status);
  }

  /** Setzt den Kategorienfilter. */
  public kategorieFilterSetzen(kategorie: string): void {
    this.kategorieFilter.set(kategorie);
  }

  /** Aktualisiert ein Formularfeld. */
  public formularfeldSetzen(feld: keyof Wissensformular, event: Event): void {
    const eingabe = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const wert = eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '');

    this.formular.update((formular: Wissensformular) => ({ ...formular, [feld]: wert }));
  }

  /** Aktualisiert die Quellenart. */
  public quellenTypSetzen(event: Event): void {
    const eingabe = event.target as HTMLSelectElement;
    this.quellenTyp.set(eingabe.value as WissensquelleTyp);
  }

  /** Aktualisiert ein Quellenfeld. */
  public quellenFeldSetzen(feld: 'titel' | 'stand' | 'referenz' | 'hinweis', event: Event): void {
    const eingabe = event.target as HTMLInputElement;
    const wert = eingabe.value.normalize('NFKC').replace(/[<>`"'\\;]/g, '').slice(0, 160);

    if (feld === 'titel') {
      this.quellenTitel.set(wert);
    } else if (feld === 'stand') {
      this.quellenStand.set(wert);
    } else if (feld === 'referenz') {
      this.quellenReferenz.set(wert);
    } else {
      this.quellenHinweis.set(wert);
    }
  }

  /** Gibt eine CSS-Klasse für Status zurück. */
  public statusKlasse(status: WissenseintragStatus): string {
    return `is-${status}`;
  }

  /** Gibt ein lesbares Statuslabel zurück. */
  public statusLabel(status: WissenseintragStatus): string {
    const labels: Record<WissenseintragStatus, string> = {
      entwurf: 'ENTWURF',
      pruefung: 'IN PRÜFUNG',
      freigegeben: 'FREIGEGEBEN'
    };

    return labels[status];
  }

  /** Liefert Qualitätschecks für einen Eintrag. */
  public qualitaetsChecks(eintrag: Wissenseintrag): { label: string; ok: boolean }[] {
    return [
      { label: 'Patientenkurztext', ok: !!eintrag.patientKurztext.trim() },
      { label: 'Patientenlangtext', ok: !!eintrag.patientLangtext.trim() },
      { label: 'Disclaimer', ok: !!eintrag.disclaimer.trim() },
      { label: 'Quellen', ok: eintrag.quellen.length > 0 },
      { label: 'Freigabe', ok: eintrag.status === 'freigegeben' }
    ];
  }

  /** Prüft Filter und Suche. */
  private eintragPasst(eintrag: Wissenseintrag): boolean {
    const suche = this.suche().trim().toLowerCase();
    const suchtext = `${eintrag.laborwertKey} ${eintrag.anzeigename} ${eintrag.kategorie} ${eintrag.patientKurztext} ${eintrag.quellen.map((quelle: Wissensquelle) => quelle.titel).join(' ')}`.toLowerCase();
    const suchePasst = !suche || suchtext.includes(suche);
    const statusPasst = this.statusFilter() === 'alle' || eintrag.status === this.statusFilter();
    const kategoriePasst = this.kategorieFilter() === 'alle' || eintrag.kategorie === this.kategorieFilter();
    return suchePasst && statusPasst && kategoriePasst;
  }

  /** Wandelt Eintrag in Formularzustand. */
  private formularAusEintrag(eintrag: Wissenseintrag): Wissensformular {
    return {
      id: eintrag.id,
      laborwertKey: eintrag.laborwertKey,
      anzeigename: eintrag.anzeigename,
      kategorie: eintrag.kategorie,
      patientKurztext: eintrag.patientKurztext,
      patientLangtext: eintrag.patientLangtext,
      arztinformation: eintrag.arztinformation,
      ursachenNiedrig: eintrag.ursachenNiedrig,
      ursachenHoch: eintrag.ursachenHoch,
      einflussfaktoren: eintrag.einflussfaktoren,
      hinweise: eintrag.hinweise,
      disclaimer: eintrag.disclaimer,
      version: eintrag.version,
      status: eintrag.status,
      quellen: [...eintrag.quellen],
      aenderungsnotiz: ''
    };
  }

  /** Wandelt Formularzustand in Eintrag zurück. */
  private eintragAusFormular(eintrag: Wissenseintrag, formular: Wissensformular): Wissenseintrag {
    return {
      ...eintrag,
      laborwertKey: formular.laborwertKey,
      anzeigename: formular.anzeigename,
      kategorie: formular.kategorie,
      patientKurztext: formular.patientKurztext,
      patientLangtext: formular.patientLangtext,
      arztinformation: formular.arztinformation,
      ursachenNiedrig: formular.ursachenNiedrig,
      ursachenHoch: formular.ursachenHoch,
      einflussfaktoren: formular.einflussfaktoren,
      hinweise: formular.hinweise,
      disclaimer: formular.disclaimer,
      quellen: [...formular.quellen],
      version: formular.version,
      status: formular.status,
      geaendertAm: this.heutigesDatumLabel(),
      geaendertVon: 'Admin',
      versionen: formular.aenderungsnotiz.trim() ? [...eintrag.versionen, { version: formular.version, datum: this.heutigesDatumLabel(), bearbeitetVon: 'Admin', notiz: formular.aenderungsnotiz.trim() }] : eintrag.versionen
    };
  }

  /** Wandelt Formularzustand in einen API-Payload um. */
  private formularZuEintrag(eintrag: Wissenseintrag, formular: Wissensformular): Wissenseintrag & { aenderungsnotiz?: string } {
    return {
      ...this.eintragAusFormular(eintrag, formular),
      aenderungsnotiz: formular.aenderungsnotiz.trim()
    };
  }

  /** Liefert ein deutsches Datumslabel für Änderungsvermerke. */
  private heutigesDatumLabel(): string {
    return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /** Spiegelt Formularquellen in die aktive Wissenskarte für Live-Zähler und Quellenindex. */
  private formularQuellenInAktivemEintragSpiegeln(quellen: Wissensquelle[]): void {
    const formularId = this.formular().id;

    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((eintrag: Wissenseintrag) => eintrag.id === formularId ? { ...eintrag, quellen: [...quellen] } : eintrag));
  }

  /** Findet eine vorhandene Quelle anhand vollständiger Identität oder Titel. */
  private passendeVorhandeneQuelleFinden(quelle: Wissensquelle): Wissensquelle | undefined {
    const identitaet = this.quellenIdentitaetsSchluessel(quelle);
    const titel = this.quellenTitelSchluessel(quelle.titel);

    return this.verfuegbareQuellen().find((vorhandeneQuelle: Wissensquelle) => this.quellenIdentitaetsSchluessel(vorhandeneQuelle) === identitaet)
      ?? this.verfuegbareQuellen().find((vorhandeneQuelle: Wissensquelle) => this.quellenTitelSchluessel(vorhandeneQuelle.titel) === titel);
  }

  /** Sortiert Quellenvorschläge nach Relevanz und Titel. */
  private quellenVorschlagSortierung(a: Wissensquelle, b: Wissensquelle, suche: string): number {
    if (!suche) {
      return a.titel.localeCompare(b.titel);
    }

    const aTitel = this.quellenTitelSchluessel(a.titel);
    const bTitel = this.quellenTitelSchluessel(b.titel);
    const aExakt = aTitel === suche ? 0 : 1;
    const bExakt = bTitel === suche ? 0 : 1;
    const aBeginn = aTitel.startsWith(suche) ? 0 : 1;
    const bBeginn = bTitel.startsWith(suche) ? 0 : 1;

    return aExakt - bExakt || aBeginn - bBeginn || a.titel.localeCompare(b.titel);
  }

  /** Liefert den Suchtext einer Quelle. */
  private quellenSuchtext(quelle: Wissensquelle): string {
    return `${quelle.titel} ${quelle.typ} ${quelle.stand} ${quelle.referenz} ${quelle.hinweis}`.toLowerCase();
  }

  /** Normalisiert Quellentitel für Vergleiche. */
  private quellenTitelSchluessel(titel: string): string {
    return titel.trim().toLowerCase();
  }

  /** Bildet eine stabile Quellenidentität ohne technische ID. */
  private quellenIdentitaetsSchluessel(quelle: Pick<Wissensquelle, 'titel' | 'typ' | 'referenz'>): string {
    return `${this.quellenTitelSchluessel(quelle.titel)}|${quelle.typ}|${quelle.referenz.trim().toLowerCase()}`;
  }

  /** Zeigt passende Toasts für Statusaktionen. */
  private statusToast(eintrag: Wissenseintrag, status: WissenseintragStatus): void {
    if (status === 'freigegeben') {
      this.toastService.zeige('Wissenskarte freigegeben', `${eintrag.anzeigename} ist jetzt berichtsfähig.`, 'success');
      return;
    }

    if (status === 'pruefung') {
      this.toastService.zeige('Zur Prüfung markiert', `${eintrag.anzeigename} wartet auf Kontrolle.`, 'warning');
    }
  }
}
