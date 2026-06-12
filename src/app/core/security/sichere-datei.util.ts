/* src/app/core/security/sichere-datei.util.ts */

/**
 * @file Enthält defensive Frontend-Prüfungen für lokale Dateiuploads.
 * @module SichereDateiUtil
 */

/** Maximale Uploadgröße im Frontend. */
export const SICHERE_DATEI_MAX_BYTES = 15 * 1024 * 1024;

/** Lesbares Uploadlimit. */
export const SICHERE_DATEI_MAX_LABEL = '15 MB';

/** Minimale Bytefolge einer PDF-Datei. */
const PDF_MAGIC_BYTES = '%PDF-';

/** Ergebnis der Dateiprüfung. */
export interface SichereDateiErgebnis {
  /** Gibt an, ob die Datei frontendseitig akzeptiert wird. */
  istGueltig: boolean;

  /** Bereinigter Dateiname für die UI. */
  dateiname: string;

  /** Lesbare Dateigröße für die UI. */
  groesse: string;

  /** Optionaler Hinweis für die Oberfläche. */
  meldung: string;
}

/** Entfernt unsichtbare Steuerzeichen aus Dateinamen. */
const STEUERZEICHEN_REGEX = /[\u0000-\u001F\u007F]/g;

/** Erkennt Pfad- und Shell-Zeichen, die in Dateinamen nicht genutzt werden sollen. */
const GEFÄHRLICHE_DATEIZEICHEN_REGEX = /[<>:"/\\|?*`$;]/g;

/** Erkennt Dateinamen mit relativen Pfadbestandteilen. */
const PFAD_TRAVERSAL_REGEX = /(^|[.\s])\.\.([.\s]|$)/;

/** Prüft, ob eine Datei als PDF-Upload erlaubt ist. */
export async function pruefeSicherePdfDatei(datei: File | null | undefined): Promise<SichereDateiErgebnis> {
  if (!datei) {
    return {
      istGueltig: false,
      dateiname: '',
      groesse: '',
      meldung: 'Keine Datei ausgewählt.'
    };
  }

  const dateiname = bereinigeDateiname(datei.name);
  const groesse = formatiereDateigroesse(datei.size);

  if (!dateiname) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Dateiname ist ungültig.'
    };
  }

  if (dateiname !== datei.name.normalize('NFKC').replace(STEUERZEICHEN_REGEX, '')) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Dateiname enthält nicht erlaubte Sonderzeichen.'
    };
  }

  if (PFAD_TRAVERSAL_REGEX.test(dateiname)) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Dateiname enthält nicht erlaubte Pfadbestandteile.'
    };
  }

  if (!dateiname.toLowerCase().endsWith('.pdf')) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Nur PDF-Dateien sind erlaubt.'
    };
  }

  if (datei.type && datei.type !== 'application/pdf') {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Dateityp wurde blockiert. Bitte eine PDF-Datei auswählen.'
    };
  }

  if (datei.size <= 0) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'Die Datei ist leer und kann nicht importiert werden.'
    };
  }

  if (datei.size > SICHERE_DATEI_MAX_BYTES) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: `Datei ist zu groß. Erlaubt sind maximal ${SICHERE_DATEI_MAX_LABEL}.`
    };
  }

  if (!(await hatPdfSignatur(datei))) {
    return {
      istGueltig: false,
      dateiname,
      groesse,
      meldung: 'PDF-Signatur fehlt. Die Datei wurde blockiert.'
    };
  }

  return {
    istGueltig: true,
    dateiname,
    groesse,
    meldung: ''
  };
}

/** Bereinigt einen Dateinamen für die Anzeige. */
function bereinigeDateiname(roherName: string): string {
  return roherName.normalize('NFKC').replace(STEUERZEICHEN_REGEX, '').replace(GEFÄHRLICHE_DATEIZEICHEN_REGEX, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

/** Prüft die PDF-Magic-Bytes am Dateianfang. */
async function hatPdfSignatur(datei: File): Promise<boolean> {
  const startBytes = await datei.slice(0, PDF_MAGIC_BYTES.length).arrayBuffer();
  const signatur = new TextDecoder('ascii', { fatal: false }).decode(startBytes);
  return signatur === PDF_MAGIC_BYTES;
}

/** Formatiert Bytes als lesbare Dateigröße. */
function formatiereDateigroesse(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}
