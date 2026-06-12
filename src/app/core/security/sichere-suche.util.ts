/* src/app/core/security/sichere-suche.util.ts */

/**
 * @file Enthält defensive Frontend-Normalisierung für Suchfelder.
 * @module SichereSucheUtil
 */

/** Maximale Länge für Suchbegriffe im Frontend. */
export const SICHERE_SUCHE_MAX_LAENGE = 80;

/** Meldung für nicht erlaubte Sonderzeichen. */
export const SICHERE_SUCHE_SONDERZEICHEN_MELDUNG = 'Sonderzeichen wie < > { } [ ] " \' ` \\ ; | $ sind nicht erlaubt.';

/** Ergebnis der Suchfeld-Normalisierung. */
export interface SichereSucheErgebnis {
  /** Bereinigter Suchbegriff. */
  wert: string;

  /** Gibt an, ob der Wert für eine Suche genutzt werden darf. */
  istGueltig: boolean;

  /** Optionaler Hinweis für die Oberfläche. */
  meldung: string;
}

/** Entfernt unsichtbare Steuerzeichen. */
const STEUERZEICHEN_REGEX = /[\u0000-\u001F\u007F]/g;

/** Entfernt Zeichen, die in Suchfeldern nicht benötigt werden. */
const GEFÄHRLICHE_ZEICHEN_REGEX = /[<>{}\[\]`"'\\;|$]/g;

/** Erkennt typische Script- und SQL-Injection-Muster. */
const VERDACHT_REGEX = /\b(script|javascript:|data:|onerror|onload|union\s+select|select\s+.*\s+from|drop\s+table|insert\s+into|delete\s+from|update\s+.*\s+set)\b|--|\/\*|\*\//i;

/** Erlaubt nur Zeichen, die für Name, ID oder Datum sinnvoll sind. */
const ERLAUBTE_SUCHE_REGEX = /^[\p{L}\p{N}\s._\-/:()]+$/u;

/** Normalisiert und prüft einen Suchbegriff defensiv vor API-Nutzung. */
export function normalisiereSichereSuche(roherWert: string): SichereSucheErgebnis {
  const normalisiert = roherWert.normalize('NFKC');
  const ohneSteuerzeichen = normalisiert.replace(STEUERZEICHEN_REGEX, '');
  const ohneGefährlicheZeichen = ohneSteuerzeichen.replace(GEFÄHRLICHE_ZEICHEN_REGEX, '');
  const gekürzt = ohneGefährlicheZeichen.slice(0, SICHERE_SUCHE_MAX_LAENGE);
  const wert = gekürzt.replace(/\s+/g, ' ').trimStart();
  const hatteSteuerzeichen = normalisiert !== ohneSteuerzeichen;
  const hatteGefährlicheZeichen = ohneSteuerzeichen !== ohneGefährlicheZeichen;

  if (VERDACHT_REGEX.test(ohneSteuerzeichen)) {
    return {
      wert,
      istGueltig: false,
      meldung: 'Suchbegriff wurde aus Sicherheitsgründen blockiert.'
    };
  }

  if (hatteSteuerzeichen || hatteGefährlicheZeichen) {
    return {
      wert,
      istGueltig: false,
      meldung: SICHERE_SUCHE_SONDERZEICHEN_MELDUNG
    };
  }

  if (!wert.trim()) {
    return { wert, istGueltig: false, meldung: '' };
  }

  if (!ERLAUBTE_SUCHE_REGEX.test(wert)) {
    return {
      wert,
      istGueltig: false,
      meldung: SICHERE_SUCHE_SONDERZEICHEN_MELDUNG
    };
  }

  if (roherWert.length > SICHERE_SUCHE_MAX_LAENGE) {
    return {
      wert,
      istGueltig: true,
      meldung: 'Suchbegriff wurde gekürzt.'
    };
  }

  return { wert, istGueltig: true, meldung: '' };
}
