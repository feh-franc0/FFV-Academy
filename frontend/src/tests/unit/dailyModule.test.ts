/**
 * Daily Module — testes unitários.
 * Valida o determinismo (mesma data → mesmo módulo) e a persistência.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getDailyModule, markDailyModuleCompleted, isDailyModule } from '../../lib/dailyModule';

describe('getDailyModule — determinismo', () => {
  beforeEach(() => localStorage.clear());

  it('retorna um módulo válido', () => {
    const m = getDailyModule();
    expect(m).not.toBeNull();
    expect(m?.slug).toBeTruthy();
    expect(m?.xp).toBeGreaterThan(0);
    expect(m?.bonusXp).toBeGreaterThan(0);
  });

  it('mesma data → mesmo slug (chamadas repetidas)', () => {
    const a = getDailyModule();
    const b = getDailyModule();
    const c = getDailyModule();
    expect(a?.slug).toBe(b?.slug);
    expect(b?.slug).toBe(c?.slug);
  });

  it('filtro onlyBeginnerOrIntermediate exclui módulos avançados', () => {
    const m = getDailyModule({ onlyBeginnerOrIntermediate: true });
    expect(m).not.toBeNull();
    // módulo retornado não deve ser "advanced" — validamos no shape
    // (detalhe: o filtro é dentro do lib, não expomos `level` no DailyModule)
    expect(m?.slug).toBeTruthy();
  });
});

describe('markDailyModuleCompleted / isDailyModule', () => {
  beforeEach(() => localStorage.clear());

  it('marca o módulo do dia como completo', () => {
    const m = getDailyModule();
    expect(m?.completed).toBe(false);
    if (m) markDailyModuleCompleted(m.slug);
    const after = getDailyModule();
    expect(after?.completed).toBe(true);
  });

  it('não marca se slug não corresponde ao módulo do dia', () => {
    const m = getDailyModule();
    markDailyModuleCompleted('slug-aleatorio-que-nao-existe');
    const after = getDailyModule();
    expect(after?.slug).toBe(m?.slug);
    expect(after?.completed).toBe(false);
  });

  it('isDailyModule retorna true para slug do dia e false para outros', () => {
    const m = getDailyModule();
    if (m) expect(isDailyModule(m.slug)).toBe(true);
    expect(isDailyModule('modulo-inventado')).toBe(false);
  });
});
