/* src/app/shared/services/toast.service.ts */

/**
 * @file Verwaltet kurze UI-Rückmeldungen für globale Toast-Nachrichten.
 * @module ToastService
 */

import { Injectable, WritableSignal, signal } from '@angular/core';

/** Toast-Ton für Statusrückmeldungen. */
export type ToastTyp = 'success' | 'warning' | 'danger' | 'info';

/** Kurze UI-Nachricht. */
export interface ToastNachricht {
  /** Eindeutige Toast-ID. */
  id: number;

  /** Ton der Nachricht. */
  typ: ToastTyp;

  /** Titel der Nachricht. */
  titel: string;

  /** Optionaler Beschreibungstext. */
  text: string;
}

/** Globaler Toast-Service für kurze Rückmeldungen. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** Aktive Toast-Nachrichten. */
  public readonly nachrichten: WritableSignal<ToastNachricht[]> = signal([]);

  /** Zeigt eine neue Nachricht an. */
  public zeige(titel: string, text = '', typ: ToastTyp = 'info'): void {
    const nachricht: ToastNachricht = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      typ,
      titel,
      text
    };

    this.nachrichten.update((liste: ToastNachricht[]) => [...liste, nachricht]);
    window.setTimeout(() => this.entfernen(nachricht.id), 3200);
  }

  /** Entfernt eine Toast-Nachricht. */
  public entfernen(id: number): void {
    this.nachrichten.update((liste: ToastNachricht[]) => liste.filter((nachricht: ToastNachricht) => nachricht.id !== id));
  }
}
