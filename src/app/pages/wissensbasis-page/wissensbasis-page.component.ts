/* src/app/pages/wissensbasis-page/wissensbasis-page.component.ts */

/**
 * @file Angular-Routenkomponente für die kontrollierte Wissensbasis.
 * @module WissensbasisPageComponent
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconActionComponent } from '../../shared/components/icon-action/icon-action.component';
import { SecureSearchComponent } from '../../shared/components/secure-search/secure-search.component';
import { WissensbasisPageController } from './wissensbasis-page-controller';

/**
 * Stellt die Route `/wissensbasis` bereit und übernimmt den dokumentierten Seitencontroller.
 */
@Component({
  selector: 'gf-wissensbasis-page',
  imports: [IconActionComponent, SecureSearchComponent],
  templateUrl: './wissensbasis-page.component.html',
  styleUrl: './wissensbasis-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WissensbasisPageComponent extends WissensbasisPageController { }
