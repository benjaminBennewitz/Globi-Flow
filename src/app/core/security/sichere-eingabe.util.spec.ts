/* src/app/core/security/sichere-eingabe.util.spec.ts */

import { describe, expect, it } from 'vitest';
import { bereinigeSichereEingabe } from './sichere-eingabe.util';

describe('sichereEingabe', () => {
  it('entfernt Script-Tags, ohne den Textinhalt auszuführen', () => {
    expect(bereinigeSichereEingabe('<script>alert(1)</script>', 'freitext', 500)).toBe('alert(1)');
  });

  it('entfernt HTML-Eventhandler', () => {
    expect(bereinigeSichereEingabe('Text onerror=alert(1)', 'freitext', 500)).toBe('Text alert(1)');
  });

  it('erhält normalen medizinischen Freitext', () => {
    expect(bereinigeSichereEingabe('Kontrolle in 4–6 Wochen; nüchtern.', 'freitext', 500)).toBe('Kontrolle in 4–6 Wochen; nüchtern.');
  });

  it('erhält Vergleichszeichen in Referenzbereichen', () => {
    expect(bereinigeSichereEingabe('< 5,6 mmol/l', 'referenz', 100)).toBe('< 5,6 mmol/l');
  });

  it('entfernt Bidirectional-Steuerzeichen', () => {
    expect(bereinigeSichereEingabe('Glukose\u202Eabc', 'freitext', 100)).toBe('Glukoseabc');
  });
});
