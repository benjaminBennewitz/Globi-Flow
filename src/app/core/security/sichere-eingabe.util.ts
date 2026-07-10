/* src/app/core/security/sichere-eingabe.util.ts */

/**
 * @file Zentrale Normalisierung und Begrenzung freier Formulareingaben.
 * @module SichereEingabeUtil
 */

/** Typen für fachlich unterschiedliche Eingabefelder. */
export type SichereEingabeTyp = 'name' | 'schluessel' | 'freitext' | 'quelle' | 'einheit' | 'referenz';

/** Entfernt ASCII-, Unicode- und Bidirectional-Steuerzeichen. */
const STEUERZEICHEN_REGEX = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

/** Entfernt vollständige Script-Tags, bevor einzelne HTML-Zeichen bereinigt werden. */
const SCRIPT_TAG_REGEX = /<\/?\s*script\b[^>]*>/gi;

/** Entfernt ausführbare Protokolle und typische HTML-Eventhandler. */
const UNSICHERE_MUSTER_REGEX = /(?:javascript|vbscript|data)\s*:|on(?:error|load|click|mouseover|focus|blur|submit|change|input|keydown|keyup)\s*=/gi;

/** Entfernt Zeichen, die in normalen Freitexten HTML-Strukturen bilden könnten. */
const UNSICHERE_TEXTZEICHEN_REGEX = /[<>`\\]/g;

/** Entfernt in Referenzbereichen nur nicht benötigte Escape-Zeichen. */
const UNSICHERE_REFERENZZEICHEN_REGEX = /[`\\]/g;

/** Feldspezifische Positivlisten. */
const ZEICHENREGELN: Record<Exclude<SichereEingabeTyp, 'freitext' | 'quelle' | 'referenz'>, RegExp> = {
  name: /[^\p{L}\p{M} .'-]/gu,
  schluessel: /[^\p{L}\p{N}._-]/gu,
  einheit: /[^\p{L}\p{N}µμ%°/²³.*^()_-]/gu
};

/**
 * Normalisiert eine Eingabe, entfernt gefährliche Fragmente und begrenzt ihre Länge.
 *
 * @param roherWert Ungeprüfter Eingabewert.
 * @param typ Fachlicher Typ des Eingabefelds.
 * @param maxLaenge Maximal erlaubte Zeichenanzahl.
 * @returns Bereinigte und begrenzte Eingabe.
 */
export function bereinigeSichereEingabe(roherWert: string, typ: SichereEingabeTyp, maxLaenge: number): string {
  const normalisiert = String(roherWert ?? '')
    .normalize('NFKC')
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(UNSICHERE_MUSTER_REGEX, '')
    .replace(STEUERZEICHEN_REGEX, '');

  const feldbereinigt = bereinigeNachFeldtyp(normalisiert, typ);

  return feldbereinigt
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .slice(0, Math.max(0, maxLaenge));
}

/**
 * Wendet die fachlich passende Zeichenregel auf einen bereits normalisierten Wert an.
 *
 * @param wert Normalisierter Eingabewert.
 * @param typ Fachlicher Typ des Eingabefelds.
 * @returns Feldspezifisch bereinigter Wert.
 */
function bereinigeNachFeldtyp(wert: string, typ: SichereEingabeTyp): string {
  if (typ === 'freitext' || typ === 'quelle') {
    return wert.replace(UNSICHERE_TEXTZEICHEN_REGEX, '');
  }

  if (typ === 'referenz') {
    return wert
      .replace(UNSICHERE_REFERENZZEICHEN_REGEX, '')
      .replace(/[^\p{L}\p{N}µμ%°/²³.,:; +\-–—<>=()_*^]/gu, '');
  }

  return wert.replace(ZEICHENREGELN[typ], '');
}
