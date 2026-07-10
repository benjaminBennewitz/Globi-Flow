/* src/app/shared/components/app-navigation/app-navigation-suchfokus.ts */

/**
 * @file Bündelt DOM-Hilfen für die visuelle Hervorhebung globaler Suchtreffer.
 * @module AppNavigationSuchfokus
 */

import { GlobaleSuchergebnis } from '../../../core/models/globale-suche.model';

const FOKUS_KLASSE = 'gf-search-focus-target';   // CSS-Klasse für das temporär hervorgehobene Zielelement.
const FOKUS_STYLE_ID = 'gf-search-focus-style';  // Eindeutige ID des global eingefügten Fokus-Styles.
const FOKUS_DAUER_MS = 2600;                     // Dauer der sichtbaren Hervorhebung in Millisekunden.

/**
 * Ergänzt die globale Fokusanimation einmalig im Dokument.
 *
 * @param dokument Dokument, in dessen Kopf der Fokus-Style eingefügt wird.
 */
export function suchfokusStyleBereitstellen(dokument: Document): void {
  if (dokument.getElementById(FOKUS_STYLE_ID)) {
    return;
  }

  const style = dokument.createElement('style'); // Neues Style-Element für die globale Suchhervorhebung.
  style.id = FOKUS_STYLE_ID;
  style.textContent = `
    .${FOKUS_KLASSE} {
      position: relative !important;
      outline: 3px solid rgba(0, 94, 184, 0.56) !important;
      outline-offset: 6px !important;
      animation: gf-search-focus-pulse 1200ms ease-in-out 0s 2 both !important;
    }

    @keyframes gf-search-focus-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 94, 184, 0.0), var(--gf-shadow-raised); }
      45% { box-shadow: 0 0 0 8px rgba(0, 94, 184, 0.14), var(--gf-shadow-raised); }
    }
  `;
  dokument.head.appendChild(style);
}

/**
 * Markiert das wahrscheinlich passende Zielelement eines Suchtreffers temporär.
 *
 * @param dokument Dokument mit dem aktuell gerenderten Routeninhalt.
 * @param ergebnis Globales Suchergebnis mit Ziel-ID und beschreibenden Texten.
 */
export function suchtrefferMarkieren(dokument: Document, ergebnis: GlobaleSuchergebnis): void {
  dokument.querySelectorAll(`.${FOKUS_KLASSE}`).forEach((element: Element) => element.classList.remove(FOKUS_KLASSE));

  const ziel = elementNachSuchergebnisFinden(dokument, ergebnis); // Wahrscheinlich passendstes sichtbares Zielelement.

  if (!(ziel instanceof HTMLElement)) {
    return;
  }

  ziel.classList.add(FOKUS_KLASSE);
  ziel.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  window.setTimeout(() => ziel.classList.remove(FOKUS_KLASSE), FOKUS_DAUER_MS);
}

/**
 * Findet routeübergreifend das konkrete Zielelement eines Suchtreffers.
 *
 * @param dokument Dokument mit dem aktuell gerenderten Routeninhalt.
 * @param ergebnis Suchergebnis, dessen Ziel ermittelt werden soll.
 * @returns Sichtbares Zielelement oder `null`, wenn kein passender Treffer existiert.
 */
function elementNachSuchergebnisFinden(dokument: Document, ergebnis: GlobaleSuchergebnis): HTMLElement | null {
  const hauptbereich = dokument.querySelector('.gf-app-main'); // Zentraler Inhaltsbereich der App-Shell.

  if (!hauptbereich) {
    return null;
  }

  const idTreffer = elementNachSuchIdFinden(hauptbereich, ergebnis.targetId || ergebnis.id); // Expliziter Treffer über stabile Such-ID.

  if (idTreffer) {
    return idTreffer;
  }

  const suchwerte = [ergebnis.title, ergebnis.subtitle, ergebnis.patientName].filter((wert): wert is string => !!wert?.trim()); // Priorisierte Texte für den Fallback-Vergleich.

  for (const suchwert of suchwerte) {
    const textTreffer = elementNachGewichtetemTextFinden(hauptbereich, suchwert); // Bester sichtbarer Treffer für den aktuellen Suchtext.

    if (textTreffer) {
      return textTreffer;
    }
  }

  return null;
}

/**
 * Findet ein Element über explizite Suchziel-Attribute.
 *
 * @param hauptbereich Routencontainer, der durchsucht wird.
 * @param id Technische ID des Suchziels.
 * @returns Sichtbares Fokusziel oder `null`.
 */
function elementNachSuchIdFinden(hauptbereich: Element, id: string | undefined): HTMLElement | null {
  const bereinigteId = id?.trim(); // Bereinigte Ziel-ID ohne führende oder folgende Leerzeichen.

  if (!bereinigteId) {
    return null;
  }

  const escapedId = cssWertEscapen(bereinigteId); // Selektorsicher maskierte Ziel-ID.
  const selektoren = [
    `[data-gf-search-id="${escapedId}"]`,
    `[data-gf-search-target="${escapedId}"]`,
    `#${escapedId}`
  ]; // Unterstützte Selektoren für explizite Suchziele.

  for (const selektor of selektoren) {
    const element = hauptbereich.querySelector(selektor); // Erstes Element für den aktuellen Selektor.

    if (element instanceof HTMLElement && elementIstSichtbar(element)) {
      return fokusfaehigesSuchElement(element);
    }
  }

  return null;
}

/**
 * Findet per Textsuche bevorzugt konkrete Karten, Zeilen und Ergebnisobjekte.
 *
 * @param hauptbereich Routencontainer, der durchsucht wird.
 * @param text Beschreibender Suchtext des globalen Treffers.
 * @returns Bestgewichtetes sichtbares Fokusziel oder `null`.
 */
function elementNachGewichtetemTextFinden(hauptbereich: Element, text: string): HTMLElement | null {
  const suchtext = suchtextNormalisieren(text); // Normalisierter Text für robuste Vergleiche.

  if (!suchtext) {
    return null;
  }

  const selektor = [
    '.gf-patienten-route__card',
    '.gf-auswertung-route__value-row',
    '.gf-review-route__candidate',
    '.gf-import-route__job',
    '.gf-wissensbasis-route__entry',
    '.gf-berichte-route__value-card',
    '.gf-overview__urgent-item',
    '.gf-overview__activity article',
    'article',
    'button',
    'a'
  ].join(', '); // Selektoren in absteigender fachlicher Relevanz.

  const kandidaten = Array.from(hauptbereich.querySelectorAll(selektor))
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .filter((element: HTMLElement) => elementIstSichtbar(element))
    .filter((element: HTMLElement) => suchtextNormalisieren(element.textContent || '').includes(suchtext))
    .map((element: HTMLElement) => fokusfaehigesSuchElement(element))
    .filter((element: HTMLElement, index: number, liste: HTMLElement[]) => liste.indexOf(element) === index)
    .sort((a: HTMLElement, b: HTMLElement) => suchfokusScore(a) - suchfokusScore(b)); // Eindeutige, sichtbare und gewichtete Kandidatenliste.

  return kandidaten[0] ?? null;
}

/**
 * Liefert ein sinnvolles Fokusziel, ohne auf äußere Seitencontainer hochzulaufen.
 *
 * @param element Ursprünglich gefundenes DOM-Element.
 * @returns Passende fachliche Karte oder das ursprüngliche Element.
 */
function fokusfaehigesSuchElement(element: HTMLElement): HTMLElement {
  const karte = element.closest('.gf-patienten-route__card, .gf-wissensbasis-route__entry, .gf-berichte-route__value-card, .gf-import-route__job, .gf-auswertung-route__value-row, .gf-review-route__candidate'); // Nächstgelegene fachliche Ergebniskarte.
  return karte instanceof HTMLElement ? karte : element;
}

/**
 * Gewichtet Treffer so, dass konkrete Karten und Zeilen vor großen Containern liegen.
 *
 * @param element Sichtbarer Kandidat der globalen Suche.
 * @returns Numerischer Score; kleinere Werte besitzen eine höhere Priorität.
 */
function suchfokusScore(element: HTMLElement): number {
  const klasse = element.className.toString();               // Vollständige CSS-Klassenliste des Kandidaten.
  const rect = element.getBoundingClientRect();              // Aktuelle sichtbare Abmessungen des Elements.
  const flaeche = Math.max(1, rect.width * rect.height);      // Mindestfläche zur stabilen Größenbewertung.
  let prioritaet = 60;                                       // Standardpriorität für generische Elemente.

  if (/gf-patienten-route__card|gf-auswertung-route__value-row|gf-review-route__candidate|gf-import-route__job|gf-wissensbasis-route__entry|gf-berichte-route__value-card/.test(klasse)) {
    prioritaet = 0;
  } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    prioritaet = 12;
  } else if (element.tagName === 'ARTICLE') {
    prioritaet = 24;
  }

  return prioritaet + flaeche / 100000;
}

/**
 * Normalisiert Suchtexte für robuste Vergleiche.
 *
 * @param wert Ursprünglicher Textwert.
 * @returns Kleingeschriebener Text mit vereinheitlichten Leerzeichen.
 */
function suchtextNormalisieren(wert: string): string {
  return wert.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Prüft, ob ein potenzielles Fokusziel sichtbar und messbar ist.
 *
 * @param element Zu prüfendes HTML-Element.
 * @returns `true`, wenn das Element sichtbar gerendert wird.
 */
function elementIstSichtbar(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect(); // Gerenderte Größe des Elements.
  return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).visibility !== 'hidden';
}

/**
 * Maskiert dynamische Werte für die sichere Verwendung in CSS-Selektoren.
 *
 * @param wert Unmaskierter Selektorwert.
 * @returns Selektorsicherer Wert.
 */
function cssWertEscapen(wert: string): string {
  if ('CSS' in window && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(wert);
  }

  return wert.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}
