/* src/app/pages/wissensbasis-page/wissensbasis-page-eintraege.ts */

/**
 * @file CRUD- und Statusworkflow der Wissensbasis-Einträge.
 * @module WissensbasisPageEintraege
 */

import { Wissenseintrag, WissenseintragStatus } from '../../core/models/wissenseintrag.model';
import { Wissensformular, formularAusEintrag, formularZuEintrag, heutigesDatumLabel, standardFarbeFuerKey, wissenseintragNormalisieren } from './wissensbasis-page-logik';
import { LEERER_WISSENSEINTRAG, WissensbasisPageZustand } from './wissensbasis-page-zustand';

/**
 * Kapselt Anlage, Speicherung, Löschung und Freigabestatus von Wissenseinträgen.
 */
export abstract class WissensbasisPageEintraege extends WissensbasisPageZustand {
  /**
   * Öffnet den Resetdialog.
   */
  public resetDialogOeffnen(): void {
    this.resetDialogOffen.set(true);
  }

  /**
   * Schließt den Resetdialog.
   */
  public resetDialogSchliessen(): void {
    this.resetDialogOffen.set(false);
  }

  /**
   * Setzt die Wissensbasis auf den fachlichen Mindestbestand zurück.
   */
  public wissensbasisZuruecksetzen(): void {
    if (this.resetLaeuft()) {
      return;
    }

    this.resetLaeuft.set(true);
    this.globiFlowApi.wissensbasisZuruecksetzen().subscribe({
      next: (antwort) => {
        const daten = antwort.items.length ? antwort.items.map((eintrag: Wissenseintrag) => wissenseintragNormalisieren(eintrag)) : [LEERER_WISSENSEINTRAG];
        this.wissenseintraege.set(daten);
        this.eintragAuswaehlen(daten[0]);
        this.resetLaeuft.set(false);
        this.resetDialogSchliessen();
        this.toastService.zeige('Wissensbasis zurückgesetzt', `${antwort.entries} Mindestwerte wurden wiederhergestellt.`, 'success');
      },
      error: () => {
        this.resetLaeuft.set(false);
        this.toastService.zeige('Reset fehlgeschlagen', 'Die Wissensbasis konnte nicht zurückgesetzt werden.', 'danger');
      }
    });
  }

  /**
   * Öffnet das Anlage-Modal.
   */
  public anlageModalOeffnen(): void {
    this.anlageModalOffen.set(true);
  }

  /**
   * Schließt das Anlage-Modal.
   */
  public anlageModalSchliessen(): void {
    this.anlageModalOffen.set(false);
  }

  /**
   * Öffnet den Löschdialog.
   *
   * @param id Technische ID des betroffenen Wissenseintrags.
   */
  public loeschDialogOeffnen(id: string): void {
    this.loeschDialogId.set(id);
  }

  /**
   * Schließt den Löschdialog.
   */
  public loeschDialogSchliessen(): void {
    this.loeschDialogId.set('');
  }

  /**
   * Erstellt einen neuen Entwurf und öffnet ihn im Editor.
   */
  public eintragAnlegen(): void {
    const laborwertKey = this.neuerLaborwertKey().trim() || 'neuer_laborwert';
    const anzeigename = this.neuerAnzeigename().trim() || 'Neuer Laborwert';
    const kategorie = this.neueKategorie().trim() || 'Neue Kategorie';
    const eintrag: Partial<Wissenseintrag> = {
      laborwertKey,
      anzeigename,
      kategorie,
      farbe: standardFarbeFuerKey(laborwertKey),
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
      geaendertAm: heutigesDatumLabel(),
      geaendertVon: 'Admin',
      versionen: [{ version: 1, datum: heutigesDatumLabel(), bearbeitetVon: 'Admin', notiz: 'Neuer Entwurf angelegt.' }]
    };

    this.globiFlowApi.wissenseintragAnlegen(eintrag).subscribe({
      next: (antwort: Wissenseintrag) => {
        const normalisierteAntwort = wissenseintragNormalisieren(antwort);
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => [normalisierteAntwort, ...eintraege.filter((wert: Wissenseintrag) => wert.id && wert.id !== normalisierteAntwort.id)]);
        this.eintragBearbeiten(normalisierteAntwort);
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

  /**
   * Löscht den im Dialog gewählten Eintrag.
   */
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

  /**
   * Setzt den Status eines Wissenseintrags lokal.
   *
   * @param id Technische ID des betroffenen Wissenseintrags.
   * @param status Neuer oder zu filternder Wissensstatus.
   */
  public eintragStatusSetzen(id: string, status: WissenseintragStatus): void {
    const eintrag = this.wissenseintraege().find((wert: Wissenseintrag) => wert.id === id);

    if (!eintrag) {
      return;
    }

    const aktualisiert: Wissenseintrag & { aenderungsnotiz?: string } = {
      ...eintrag,
      status,
      geaendertAm: heutigesDatumLabel(),
      geaendertVon: 'Admin',
      aenderungsnotiz: `Status auf ${status} gesetzt.`
    };

    this.globiFlowApi.wissenseintragSpeichern(aktualisiert, eintrag.laborwertKey).subscribe({
      next: (antwort: Wissenseintrag) => {
        const normalisierteAntwort = wissenseintragNormalisieren(antwort);
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((wert: Wissenseintrag) => wert.id === id ? normalisierteAntwort : wert));

        if (this.aktiverEintragId() === id) {
          this.formular.set(formularAusEintrag(normalisierteAntwort));
        }

        this.statusToast(normalisierteAntwort, status);
      },
      error: () => {
        this.toastService.zeige('Status nicht gespeichert', `${eintrag.anzeigename} konnte nicht aktualisiert werden.`, 'danger');
      }
    });
  }

  /**
   * Öffnet den Löschdialog für den aktiven Eintrag.
   */
  public eintragLoeschen(): void {
    this.loeschDialogOeffnen(this.formular().id);
  }

  /**
   * Speichert Formularwerte dauerhaft über die Backend-API.
   */
  public entwurfSpeichern(): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    const formular = this.formular();
    const eintrag = this.aktiverEintrag();
    const payload = formularZuEintrag(eintrag, formular);

    this.globiFlowApi.wissenseintragSpeichern(payload, eintrag.laborwertKey).subscribe({
      next: (antwort: Wissenseintrag) => {
        const normalisierteAntwort = wissenseintragNormalisieren(antwort);
        this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((wert: Wissenseintrag) => wert.id === formular.id ? normalisierteAntwort : wert));
        this.eintragAuswaehlen(normalisierteAntwort);
        this.toastService.zeige('Änderungen gespeichert', `${normalisierteAntwort.anzeigename} wurde in der Datenbank aktualisiert.`, 'success');
      },
      error: () => {
        this.toastService.zeige('Speichern fehlgeschlagen', `${formular.anzeigename} konnte nicht aktualisiert werden.`, 'danger');
      }
    });
  }

  /**
   * Setzt den Formularstatus ohne sofortige Speicherung.
   *
   * @param status Neuer oder zu filternder Wissensstatus.
   */
  public statusSetzen(status: WissenseintragStatus): void {
    this.formular.update((formular: Wissensformular) => ({ ...formular, status }));
  }

  /**
   * Setzt den Formularstatus und speichert ihn direkt.
   *
   * @param status Neuer oder zu filternder Wissensstatus.
   */
  public statusSetzenUndSpeichern(status: WissenseintragStatus): void {
    this.statusSetzen(status);
    this.entwurfSpeichern();
  }


  /**
   * Zeigt passende Toasts für Statusaktionen.
   *
   * @param eintrag Ausgewählter oder zu verarbeitender Wissenseintrag.
   * @param status Neuer oder zu filternder Wissensstatus.
   */
  protected statusToast(eintrag: Wissenseintrag, status: WissenseintragStatus): void {
    if (status === 'freigegeben') {
      this.toastService.zeige('Wissenskarte freigegeben', `${eintrag.anzeigename} ist jetzt berichtsfähig.`, 'success');
      return;
    }

    if (status === 'pruefung') {
      this.toastService.zeige('Zur Prüfung markiert', `${eintrag.anzeigename} wartet auf Kontrolle.`, 'warning');
    }
  }
}
