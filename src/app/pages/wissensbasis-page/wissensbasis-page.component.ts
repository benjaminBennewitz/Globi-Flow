/* src/app/pages/wissensbasis-page/wissensbasis-page.component.ts */

/**
 * @file Routenseite für kontrollierte Wissensbasis mit Editor und Quellenindex.
 * @module WissensbasisPageComponent
 */

import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { MOCK_WISSENSEINTRAEGE } from '../../core/mocks/wissenseintraege.mock';
import { Wissenseintrag, WissenseintragStatus, Wissensquelle, WissensquelleTyp } from '../../core/models/wissenseintrag.model';
import { IconActionComponent } from '../../shared/components/icon-action/icon-action.component';
import { SecureSearchComponent } from '../../shared/components/secure-search/secure-search.component';
import { ToastService } from '../../shared/services/toast.service';

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

/** Route `/wissensbasis` für kontrollierte Erklärungstexte. */
@Component({
  selector: 'dd-wissensbasis-page',
  imports: [IconActionComponent, SecureSearchComponent],
  templateUrl: './wissensbasis-page.component.html',
  styleUrl: './wissensbasis-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WissensbasisPageComponent {
  /** Toast-Service für Statusrückmeldungen. */
  private readonly toastService = inject(ToastService);

  /** Lokale Wissenseinträge bis zur späteren API-Anbindung. */
  public readonly wissenseintraege: WritableSignal<Wissenseintrag[]> = signal([...MOCK_WISSENSEINTRAEGE]);

  /** Aktive Wissens-ID. */
  public readonly aktiverEintragId: WritableSignal<string> = signal(MOCK_WISSENSEINTRAEGE[0].id);

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
  public readonly formular: WritableSignal<Wissensformular> = signal(this.formularAusEintrag(MOCK_WISSENSEINTRAEGE[0]));

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

  /** Kategorien der vorhandenen Einträge. */
  public readonly kategorien = computed(() => ['alle', ...Array.from(new Set(this.wissenseintraege().map((eintrag: Wissenseintrag) => eintrag.kategorie)))]);

  /** Gefilterte Wissenseinträge. */
  public readonly sichtbareEintraege = computed(() => this.wissenseintraege().filter((eintrag: Wissenseintrag) => this.eintragPasst(eintrag)));

  /** Quellenindex über alle Einträge. */
  public readonly quellenindex = computed(() => {
    const quellen = this.wissenseintraege().flatMap((eintrag: Wissenseintrag) => eintrag.quellen.map((quelle: Wissensquelle) => ({ ...quelle, eintrag: eintrag.anzeigename, laborwertKey: eintrag.laborwertKey })));
    return quellen.sort((a, b) => a.titel.localeCompare(b.titel));
  });

  /** Aktiver Wissenseintrag. */
  public aktiverEintrag(): Wissenseintrag {
    return this.wissenseintraege().find((eintrag: Wissenseintrag) => eintrag.id === this.aktiverEintragId()) ?? this.wissenseintraege()[0] ?? MOCK_WISSENSEINTRAEGE[0];
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
    const eintrag: Wissenseintrag = {
      id: `wissen-local-${Date.now()}`,
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
      geaendertAm: '12.06.2026',
      geaendertVon: 'Admin',
      versionen: [{ version: 1, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: 'Neuer Entwurf angelegt.' }]
    };

    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => [eintrag, ...eintraege]);
    this.eintragAuswaehlen(eintrag);
    this.neuerLaborwertKey.set('');
    this.neuerAnzeigename.set('');
    this.neueKategorie.set('');
    this.anlageModalSchliessen();
    this.toastService.zeige('Wissenskarte angelegt', `${anzeigename} wurde als Entwurf erstellt.`, 'success');
  }

  /** Löscht den im Dialog gewählten Eintrag. */
  public eintragWirklichLoeschen(): void {
    const eintrag = this.loeschDialogEintrag();

    if (!eintrag) {
      return;
    }

    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.filter((wert: Wissenseintrag) => wert.id !== eintrag.id));

    if (this.aktiverEintragId() === eintrag.id && this.wissenseintraege()[0]) {
      this.eintragAuswaehlen(this.wissenseintraege()[0]);
    }

    this.loeschDialogSchliessen();
    this.toastService.zeige('Wissenskarte gelöscht', `${eintrag.anzeigename} wurde entfernt.`, 'danger');
  }

  /** Setzt den Status eines Wissenseintrags lokal. */
  public eintragStatusSetzen(id: string, status: WissenseintragStatus): void {
    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((eintrag: Wissenseintrag) => eintrag.id === id ? { ...eintrag, status, geaendertAm: '12.06.2026' } : eintrag));
    const eintrag = this.wissenseintraege().find((wert: Wissenseintrag) => wert.id === id);

    if (eintrag && this.aktiverEintragId() === id) {
      this.formular.set(this.formularAusEintrag(eintrag));
    }

    if (eintrag) {
      this.statusToast(eintrag, status);
    }
  }

  /** Öffnet den Löschdialog für den aktiven Eintrag. */
  public eintragLoeschen(): void {
    this.loeschDialogOeffnen(this.formular().id);
  }

  /** Speichert Formularwerte lokal in den Mockdaten. */
  public entwurfSpeichern(): void {
    const formular = this.formular();
    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((eintrag: Wissenseintrag) => eintrag.id === formular.id ? this.eintragAusFormular(eintrag, formular) : eintrag));
    this.toastService.zeige('Änderungen gespeichert', `${formular.anzeigename} wurde lokal aktualisiert.`, 'success');
  }

  /** Setzt den Formularstatus ohne sofortige Speicherung. */
  public statusSetzen(status: WissenseintragStatus): void {
    this.formular.update((formular: Wissensformular) => ({ ...formular, status }));
  }

  /** Setzt den Formularstatus und speichert ihn direkt. */
  public statusSetzenUndSpeichern(status: WissenseintragStatus): void {
    this.statusSetzen(status);
    this.entwurfSpeichern();
    this.statusToast(this.aktiverEintrag(), status);
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

    const quelle: Wissensquelle = {
      id: `quelle-local-${Date.now()}`,
      titel,
      typ: this.quellenTyp(),
      stand: this.quellenStand().trim() || 'ohne Stand',
      referenz: this.quellenReferenz().trim(),
      hinweis: this.quellenHinweis().trim()
    };

    this.formular.update((formular: Wissensformular) => ({ ...formular, quellen: [...formular.quellen, quelle] }));
    this.quellenTitel.set('');
    this.quellenStand.set('');
    this.quellenReferenz.set('');
    this.quellenHinweis.set('');
    this.toastService.zeige('Quelle hinzugefügt', titel, 'success');
  }

  /** Entfernt eine Quelle aus dem Formular. */
  public quelleEntfernen(id: string): void {
    this.formular.update((formular: Wissensformular) => ({ ...formular, quellen: formular.quellen.filter((quelle: Wissensquelle) => quelle.id !== id) }));
    this.toastService.zeige('Quelle entfernt', 'Die Quelle wurde aus dem Formular entfernt.', 'warning');
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
      geaendertAm: '12.06.2026',
      geaendertVon: 'Admin',
      versionen: formular.aenderungsnotiz.trim() ? [...eintrag.versionen, { version: formular.version, datum: '12.06.2026', bearbeitetVon: 'Admin', notiz: formular.aenderungsnotiz.trim() }] : eintrag.versionen
    };
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
