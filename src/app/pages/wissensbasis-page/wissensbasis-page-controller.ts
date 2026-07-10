/* src/app/pages/wissensbasis-page/wissensbasis-page-controller.ts */

/**
 * @file Zusammengeführter Seitencontroller der Wissensbasis.
 * @module WissensbasisPageController
 */

import { Directive } from '@angular/core';
import { WissensbasisPageQuellen } from './wissensbasis-page-quellen';

/**
 * Führt gemeinsamen Zustand, Eintragsworkflow und Quellenverwaltung zusammen.
 */
@Directive()
export class WissensbasisPageController extends WissensbasisPageQuellen { }
