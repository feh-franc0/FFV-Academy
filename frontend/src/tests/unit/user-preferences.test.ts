import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  countSignals,
  loadPreferences,
  savePreferences,
} from '@/lib/user-preferences';

describe('user-preferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loadPreferences retorna DEFAULT quando localStorage vazio', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('savePreferences + loadPreferences faz round-trip', () => {
    const custom = {
      ...DEFAULT_PREFERENCES,
      interestedBases: ['medicina-veterinaria'],
      homeBase: 'medicina-veterinaria',
      learningGoals: 'Passar em Genética',
      preferredMaterials: ['text' as const, 'quiz' as const],
    };
    savePreferences(custom);
    const loaded = loadPreferences();
    expect(loaded.interestedBases).toEqual(['medicina-veterinaria']);
    expect(loaded.homeBase).toBe('medicina-veterinaria');
    expect(loaded.learningGoals).toBe('Passar em Genética');
  });

  it('loadPreferences rejeita JSON corrompido e cai pro default', () => {
    window.localStorage.setItem('ffv_user_preferences_v1', '{not valid json');
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('loadPreferences rejeita shape inválido (zod) e remove o item', () => {
    window.localStorage.setItem(
      'ffv_user_preferences_v1',
      JSON.stringify({ interestedBases: 'not an array' }),
    );
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(window.localStorage.getItem('ffv_user_preferences_v1')).toBeNull();
  });

  describe('countSignals', () => {
    it('zero quando user tá no estado default (sem customização)', () => {
      expect(countSignals(DEFAULT_PREFERENCES)).toBe(0);
    });

    it('1 sinal só com base de interesse', () => {
      expect(
        countSignals({ ...DEFAULT_PREFERENCES, interestedBases: ['tecnologia'] }),
      ).toBe(1);
    });

    it('4 sinais (max) com bases + home + metas + frequência customizada', () => {
      const full = {
        ...DEFAULT_PREFERENCES,
        interestedBases: ['tecnologia', 'medicina-veterinaria'],
        homeBase: 'tecnologia',
        learningGoals: 'Dominar IA aplicada',
        frequency: { kind: 'daily' as const },
      };
      expect(countSignals(full)).toBe(4);
    });

    it('não conta objetivo vazio ou muito curto', () => {
      expect(
        countSignals({ ...DEFAULT_PREFERENCES, learningGoals: '   ' }),
      ).toBe(0);
      expect(
        countSignals({ ...DEFAULT_PREFERENCES, learningGoals: 'oi' }),
      ).toBe(0);
    });

    it('frequência igual ao default (weekly:3) NÃO conta sinal; outras valores contam', () => {
      // Default = weekly:3 → 0 sinais
      expect(countSignals(DEFAULT_PREFERENCES)).toBe(0);
      // Mesmo weekly mas dias diferentes = customizado
      expect(
        countSignals({
          ...DEFAULT_PREFERENCES,
          frequency: { kind: 'weekly', daysPerWeek: 5 },
        }),
      ).toBe(1);
      // Daily = customizado
      expect(
        countSignals({ ...DEFAULT_PREFERENCES, frequency: { kind: 'daily' } }),
      ).toBe(1);
      // Dias específicos = customizado
      expect(
        countSignals({
          ...DEFAULT_PREFERENCES,
          frequency: { kind: 'specific_days', weekdays: [1, 3, 5] },
        }),
      ).toBe(1);
    });
  });
});
