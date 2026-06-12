/* src/app/shared/components/toast-container/toast-container.component.ts */

/**
 * @file Rendert globale Toast-Nachrichten.
 * @module ToastContainerComponent
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

/** Globaler Container für kurze Statusmeldungen. */
@Component({
  selector: 'dd-toast-container',
  imports: [],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  /** Toast-Service mit aktiven Nachrichten. */
  public readonly toastService = inject(ToastService);
}
