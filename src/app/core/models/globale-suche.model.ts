/* src/app/core/models/globale-suche.model.ts */

/**
 * @file Modelle für die backendseitige globale Suche.
 * @module GlobaleSucheModel
 */

/** Einzelnes Ergebnis der globalen Suche. */
export interface GlobaleSuchergebnis {
  id: string;            // Stabile Ergebnis-ID.
  title: string;         // Hauptebene des Ergebnisses.
  subtitle: string;      // Ergänzende Trefferinformationen.
  badge: string;         // Kurzes Inhaltslabel.
  route: string;         // Zielroute innerhalb der App.
  targetId?: string;     // ID der fachlichen Zielkarte für visuelles Fokusfeedback.
  patientId?: string;    // Zugeordnete Testpersonen-ID, falls das Ergebnis patientengebunden ist.
  patientName?: string;  // Anzeigename der zugeordneten Testperson.
  icon: string;          // Material-Symbol für die Treffergruppe.
}

/** Gruppierte Ergebnisliste der globalen Suche. */
export interface GlobaleSuchgruppe {
  key: string;                   // Technischer Gruppenschlüssel.
  label: string;                 // Anzeigename der Gruppe.
  route: string;                 // Zielroute der Gruppe.
  items: GlobaleSuchergebnis[];  // Treffer dieser Gruppe.
}

/** Antwort der globalen Backend-Suche. */
export interface GlobaleSucheAntwort {
  query: string;                // Bereinigte Suchanfrage.
  total: number;                // Anzahl gelieferter Treffer.
  groups: GlobaleSuchgruppe[];  // Gruppierte Treffer.
}
