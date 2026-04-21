/**
 * Storage Adapter — testes unitários.
 *
 * Valida o contrato do adapter:
 * - SSR safety (fallbacks sem `window`)
 * - Tolerância a JSON corrompido
 * - Isolamento de chaves conhecidas
 * - Propagação de erros via callback
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getRaw, setRaw, removeKey, getJSON, setJSON,
  clearAll, listKnownKeys, onStorageError,
} from '../../lib/storage';
import { STORAGE_KEYS } from '../../lib/constants';

describe('Storage adapter — contrato básico', () => {
  it('getRaw retorna null em chave inexistente', () => {
    expect(getRaw(STORAGE_KEYS.GAME_STATE)).toBeNull();
  });

  it('setRaw + getRaw roundtrip', () => {
    expect(setRaw(STORAGE_KEYS.THEME, 'dark')).toBe(true);
    expect(getRaw(STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('getJSON retorna fallback para chave inexistente', () => {
    expect(getJSON(STORAGE_KEYS.REFERRAL, null)).toBeNull();
    expect(getJSON(STORAGE_KEYS.REFERRAL, { default: true })).toEqual({ default: true });
  });

  it('getJSON retorna fallback para JSON corrompido', () => {
    localStorage.setItem(STORAGE_KEYS.REFERRAL, 'não-é-json-válido-{{{');
    expect(getJSON(STORAGE_KEYS.REFERRAL, null)).toBeNull();
  });

  it('setJSON + getJSON roundtrip para objeto complexo', () => {
    const payload = { a: 1, b: [true, false], c: { nested: 'ok' } };
    expect(setJSON(STORAGE_KEYS.DAILY_MODULE, payload)).toBe(true);
    expect(getJSON(STORAGE_KEYS.DAILY_MODULE, null)).toEqual(payload);
  });

  it('removeKey apaga valor', () => {
    setRaw(STORAGE_KEYS.THEME, 'light');
    expect(removeKey(STORAGE_KEYS.THEME)).toBe(true);
    expect(getRaw(STORAGE_KEYS.THEME)).toBeNull();
  });
});

describe('Storage adapter — clearAll', () => {
  it('remove apenas chaves conhecidas do app', () => {
    // Seta chaves do app + uma chave estranha
    setRaw(STORAGE_KEYS.GAME_STATE, 'x');
    setRaw(STORAGE_KEYS.REFERRAL, 'y');
    localStorage.setItem('OUTRO_APP_KEY', 'preservar');

    clearAll();

    expect(getRaw(STORAGE_KEYS.GAME_STATE)).toBeNull();
    expect(getRaw(STORAGE_KEYS.REFERRAL)).toBeNull();
    // Chave de outro app não deve ser tocada
    expect(localStorage.getItem('OUTRO_APP_KEY')).toBe('preservar');
  });
});

describe('Storage adapter — whitelist de chaves', () => {
  it('listKnownKeys retorna exatamente as 7 chaves do app', () => {
    const keys = listKnownKeys();
    expect(keys).toHaveLength(Object.keys(STORAGE_KEYS).length);
    expect(keys).toContain('ffv_academy');
    expect(keys).toContain('ffv_theme');
  });
});

describe('Storage adapter — error propagation', () => {
  it('onStorageError recebe notificação em quota exceeded', () => {
    const spy = vi.fn();
    onStorageError(spy);
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    };
    try {
      const ok = setRaw(STORAGE_KEYS.GAME_STATE, 'big-payload');
      expect(ok).toBe(false);
      expect(spy).toHaveBeenCalled();
    } finally {
      Storage.prototype.setItem = originalSetItem;
    }
  });
});
