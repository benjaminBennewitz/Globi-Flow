/* src/app/app.smoke.spec.ts */

/**
 * @file Minimaler Smoke-Test für den Angular-Testlauf.
 * @module AppSmokeSpec
 */

import { describe, expect, it } from 'vitest';

/** Prüft, ob die Testumgebung grundsätzlich lauffähig ist. */
describe('Daten Dashboards Smoke-Test', () => {
  /** Erwartet eine stabile Projektbezeichnung. */
  it('sollte den Projektnamen kennen', () => {
    const projektname = 'Daten Dashboards';

    expect(projektname).toContain('Dashboards');
  });
});
