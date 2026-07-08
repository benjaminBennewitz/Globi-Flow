/* src/app/app.smoke.spec.ts */

/**
 * @file Minimaler Smoke-Test für den Angular-Testlauf.
 * @module AppSmokeSpec
 */

import { describe, expect, it } from 'vitest';

/** Prüft, ob die Testumgebung grundsätzlich lauffähig ist. */
describe('Globi Flow Smoke-Test', () => {
  /** Erwartet eine stabile Projektbezeichnung. */
  it('sollte den Projektnamen kennen', () => {
    const projektname = 'Globi Flow';

    expect(projektname).toContain('Flow');
  });
});
