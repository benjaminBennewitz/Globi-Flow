/* src/app/core/models/globale-suche.model.ts */

/**
 * @file Modelle für die backendseitige globale Suche.
 * @module GlobaleSucheModel
 */

/** Einzelnes Ergebnis der globalen Suche. */
export interface GlobaleSuchergebnis {
  /** Stabile Ergebnis-ID. */
  id: string;

  /** Hauptebene des Ergebnisses. */
  title: string;

  /** Ergänzende Trefferinformationen. */
  subtitle: string;

  /** Kurzes Inhaltslabel. */
  badge: string;

  /** Zielroute innerhalb der App. */
  route: string;

  /** ID der fachlichen Zielkarte für visuelles Fokusfeedback. */
  targetId?: string;

  /** Zugeordnete Testpersonen-ID, falls das Ergebnis patientengebunden ist. */
  patientId?: string;

  /** Anzeigename der zugeordneten Testperson. */
  patientName?: string;

  /** Material-Symbol für die Treffergruppe. */
  icon: string;
}

/** Gruppierte Ergebnisliste der globalen Suche. */
export interface GlobaleSuchgruppe {
  /** Technischer Gruppenschlüssel. */
  key: string;

  /** Anzeigename der Gruppe. */
  label: string;

  /** Zielroute der Gruppe. */
  route: string;

  /** Treffer dieser Gruppe. */
  items: GlobaleSuchergebnis[];
}

/** Antwort der globalen Backend-Suche. */
export interface GlobaleSucheAntwort {
  /** Bereinigte Suchanfrage. */
  query: string;

  /** Anzahl gelieferter Treffer. */
  total: number;

  /** Gruppierte Treffer. */
  groups: GlobaleSuchgruppe[];
}
