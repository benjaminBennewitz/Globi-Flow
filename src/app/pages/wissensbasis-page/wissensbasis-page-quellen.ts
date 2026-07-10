/* src/app/pages/wissensbasis-page/wissensbasis-page-quellen.ts */

/**
 * @file Quellenverwaltung der Wissensbasis.
 * @module WissensbasisPageQuellen
 */

import { Wissenseintrag, Wissensquelle, WissensquelleTyp } from '../../core/models/wissenseintrag.model';
import { bereinigeSichereEingabe } from '../../core/security/sichere-eingabe.util';
import { Wissensformular, normalisiereQuellenStand, quellenIdentitaetsSchluessel, quellenSuchtext, quellenTitelSchluessel, quellenTypAnzeigename, quellenVorschlagSortierung } from './wissensbasis-page-logik';
import { WissensbasisPageEintraege } from './wissensbasis-page-eintraege';

/**
 * Kapselt Quellenauswahl, Quellenformular und Quellenzuordnung.
 */
export abstract class WissensbasisPageQuellen extends WissensbasisPageEintraege {
  public quellenindexUmschalten(): void {
    this.quellenindexOffen.update((wert: boolean) => !wert);
  }

  /**
   * Fügt eine Quelle zum aktiven Formular hinzu.
   */
  public quelleHinzufuegen(): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    const titel = this.quellenTitel().trim();

    if (!titel) {
      return;
    }

    const quellenEntwurf: Wissensquelle = {
      id: `quelle-local-${Date.now()}`,
      titel,
      typ: this.quellenTyp(),
      stand: normalisiereQuellenStand(this.quellenStand()) || 'ohne Stand',
      referenz: this.quellenReferenz().trim(),
      hinweis: this.quellenHinweis().trim()
    };
    const vorhandeneQuelle = this.passendeVorhandeneQuelleFinden(quellenEntwurf);
    const quelle: Wissensquelle = {
      id: vorhandeneQuelle?.id ?? quellenEntwurf.id,
      titel: vorhandeneQuelle?.titel ?? quellenEntwurf.titel,
      typ: vorhandeneQuelle?.typ ?? quellenEntwurf.typ,
      stand: normalisiereQuellenStand(quellenEntwurf.stand !== 'ohne Stand' ? quellenEntwurf.stand : vorhandeneQuelle?.stand ?? quellenEntwurf.stand) || 'ohne Stand',
      referenz: quellenEntwurf.referenz || vorhandeneQuelle?.referenz || '',
      hinweis: quellenEntwurf.hinweis || vorhandeneQuelle?.hinweis || ''
    };
    const aktuelleQuellen = this.formular().quellen;

    if (aktuelleQuellen.some((formularQuelle: Wissensquelle) => quellenIdentitaetsSchluessel(formularQuelle) === quellenIdentitaetsSchluessel(quelle))) {
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

  /**
   * Entfernt eine Quelle aus dem Formular.
   *
   * @param id Technische ID des betroffenen Wissenseintrags.
   */
  public quelleEntfernen(id: string): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    const quellen = this.formular().quellen.filter((quelle: Wissensquelle) => quelle.id !== id);

    this.formular.update((formular: Wissensformular) => ({ ...formular, quellen }));
    this.formularQuellenInAktivemEintragSpiegeln(quellen);
    this.toastService.zeige('Quelle entfernt', 'Die Quelle wurde aus dem Formular entfernt.', 'warning');
  }

  /**
   * Öffnet die Quellenvorschläge.
   */
  public quellenVorschlaegeOeffnen(): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    this.quellenVorschlaegeOffen.set(true);
  }

  /**
   * Wählt eine vorhandene Quelle für das Quellenformular aus.
   *
   * @param quelle Ausgewählte oder zu verarbeitende Wissensquelle.
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */
  public quelleAuswaehlen(quelle: Wissensquelle, event?: Event): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    event?.preventDefault();
    this.quellenTitel.set(quelle.titel);
    this.quellenTyp.set(quelle.typ);
    this.quellenStand.set(normalisiereQuellenStand(quelle.stand));
    this.quellenReferenz.set(quelle.referenz);
    this.quellenHinweis.set(quelle.hinweis);
    this.quellenVorschlaegeOffen.set(false);
  }

  /**
   * Prüft, ob eine Quelle dem aktuellen Formular bereits zugeordnet ist.
   *
   * @param quelle Ausgewählte oder zu verarbeitende Wissensquelle.
   * @returns `true`, wenn die fachliche Bedingung erfüllt ist.
   */
  public quelleIstBereitsZugeordnet(quelle: Wissensquelle): boolean {
    return this.formular().quellen.some((formularQuelle: Wissensquelle) => quellenIdentitaetsSchluessel(formularQuelle) === quellenIdentitaetsSchluessel(quelle));
  }

  /**
   * Liefert einen stabilen Track-Key für Quellenvorschläge.
   *
   * @param quelle Ausgewählte oder zu verarbeitende Wissensquelle.
   * @returns Formatierter Anzeige- oder Identitätswert.
   */
  public quellenTrackKey(quelle: Wissensquelle): string {
    return quellenIdentitaetsSchluessel(quelle);
  }

  /**
   * Gibt das Label einer Quellenart zurück.
   *
   * @param typ Ausgewählte Quellenart.
   * @returns Formatierter Anzeige- oder Identitätswert.
   */
  public quellenTypAnzeigename(typ: WissensquelleTyp): string {
    return this.quellenTypen.find((option) => option.key === typ)?.label ?? 'Demo';
  }

  /**
   * Liefert die Metazeile eines Quellenvorschlags.
   *
   * @param quelle Ausgewählte oder zu verarbeitende Wissensquelle.
   * @returns Formatierter Anzeige- oder Identitätswert.
   */
  public quellenVorschlagMeta(quelle: Wissensquelle): string {
    const meta = [quellenTypAnzeigename(quelle.typ, this.quellenTypen), quelle.stand, quelle.referenz].filter((wert: string) => !!wert.trim());

    if (this.quelleIstBereitsZugeordnet(quelle)) {
      meta.push('Bereits zugeordnet');
    }

    return meta.join(' · ');
  }

  /**
   * Öffnet oder schließt die Quellenart-Auswahl.
   */
  public quellenTypDropdownUmschalten(): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    this.quellenTypDropdownOffen.update((offen: boolean) => !offen);
  }

  /**
   * Setzt die Quellenart über die eigene Auswahl.
   *
   * @param typ Ausgewählte Quellenart.
   */
  public quellenTypAuswaehlen(typ: WissensquelleTyp): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    this.quellenTyp.set(typ);
    this.quellenTypDropdownOffen.set(false);
  }

  /**
   * Gibt das Label der aktuellen Quellenart zurück.
   *
   * @returns Formatierter Anzeige- oder Identitätswert.
   */
  public quellenTypLabel(): string {
    return this.quellenTypen.find((typ) => typ.key === this.quellenTyp())?.label ?? 'Demo';
  }


  /**
   * Aktiviert oder deaktiviert die Kategoriepills im Anlageformular.
   *
   * @param aktiv Gewünschter Aktivzustand der Kategorieauswahl.

  public quellenTypSetzen(event: Event): void {
    const eingabe = event.target as HTMLSelectElement;
    this.quellenTyp.set(eingabe.value as WissensquelleTyp);
  }

  /**
   * Aktualisiert ein Quellenfeld.
   *
   * @param feld Zu aktualisierendes Formularfeld.
   * @param event Optionales Browserereignis der Benutzerinteraktion.
   */
  public quellenFeldSetzen(feld: 'titel' | 'stand' | 'referenz' | 'hinweis', event: Event): void {
    if (!this.bearbeitungsmodusAktiv()) {
      return;
    }

    const eingabe = event.target as HTMLInputElement;
    const maxLaenge = feld === 'hinweis' ? 500 : 300;
    const wert = bereinigeSichereEingabe(eingabe.value, 'quelle', maxLaenge);

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

  /**
   * Spiegelt Formularquellen in die aktive Wissenskarte.
   *
   * @param quellen Aktuell im Formular zugeordnete Quellen.
   */
  private formularQuellenInAktivemEintragSpiegeln(quellen: Wissensquelle[]): void {
    const formularId = this.formular().id;  // ID des aktuell bearbeiteten Eintrags.
    this.wissenseintraege.update((eintraege: Wissenseintrag[]) => eintraege.map((eintrag: Wissenseintrag) => eintrag.id === formularId ? { ...eintrag, quellen: [...quellen] } : eintrag));
  }

  /**
   * Findet eine vorhandene Quelle über Identität oder Titel.
   *
   * @param quelle Neu erfasster Quellenentwurf.
   * @returns Passende vorhandene Quelle oder `undefined`.
   */
  private passendeVorhandeneQuelleFinden(quelle: Wissensquelle): Wissensquelle | undefined {
    const identitaet = quellenIdentitaetsSchluessel(quelle);  // Vollständiger Identitätsschlüssel.
    const titel = quellenTitelSchluessel(quelle.titel);       // Normalisierter Titel.
    return this.verfuegbareQuellen().find((vorhandeneQuelle: Wissensquelle) => quellenIdentitaetsSchluessel(vorhandeneQuelle) === identitaet)
      ?? this.verfuegbareQuellen().find((vorhandeneQuelle: Wissensquelle) => quellenTitelSchluessel(vorhandeneQuelle.titel) === titel);
  }

  /** Liefert die CSS-Klasse eines Wissensstatus. */
}
