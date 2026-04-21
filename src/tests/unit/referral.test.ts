/**
 * Sistema de referral — testes unitários.
 * Foca em validação de input, idempotência e estabilidade do ID próprio.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMyReferralId,
  captureReferralFromUrl,
  getReferralRecord,
  markReferralBonusGranted,
  getMyReferralLink,
  buildReferralShareText,
} from '../../lib/referral';

function setUrl(search: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, search },
  });
}

describe('getMyReferralId', () => {
  it('gera um ID estável com 8 chars alfanuméricos lowercase', () => {
    const id = getMyReferralId();
    expect(id).toMatch(/^[a-z0-9]{8}$/);
  });

  it('retorna mesmo ID em chamadas subsequentes', () => {
    const a = getMyReferralId();
    const b = getMyReferralId();
    expect(a).toBe(b);
  });
});

describe('captureReferralFromUrl — validação', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('aceita refId válido com 3-32 chars alfanuméricos', () => {
    setUrl('?ref=abc123xyz');
    expect(captureReferralFromUrl()).toBe('abc123xyz');
    expect(getReferralRecord()?.refId).toBe('abc123xyz');
  });

  it('ignora refId com menos de 3 chars', () => {
    setUrl('?ref=ab');
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('ignora refId com mais de 32 chars', () => {
    setUrl('?ref=' + 'x'.repeat(33));
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('rejeita tentativa de XSS', () => {
    setUrl('?ref=<img src=x>');
    expect(captureReferralFromUrl()).toBeNull();
    expect(getReferralRecord()).toBeNull();
  });

  it('rejeita caracteres maiúsculos (whitelist strict lowercase)', () => {
    setUrl('?ref=ABC123');
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('rejeita espaços e pontuação', () => {
    setUrl('?ref=abc%20xyz'); // "abc xyz" decodificado
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('rejeita javascript: protocol injection', () => {
    setUrl('?ref=' + encodeURIComponent('javascript:alert(1)'));
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('não sobrescreve registro existente (primeira impressão vence)', () => {
    setUrl('?ref=primeiro1');
    captureReferralFromUrl();
    setUrl('?ref=segundo22');
    expect(captureReferralFromUrl()).toBeNull();
    expect(getReferralRecord()?.refId).toBe('primeiro1');
  });

  it('rejeita self-referral (mesmo ID do usuário)', () => {
    const myId = getMyReferralId();
    setUrl(`?ref=${myId}`);
    expect(captureReferralFromUrl()).toBeNull();
  });
});

describe('markReferralBonusGranted', () => {
  it('altera bonusGranted para true', () => {
    setUrl('?ref=abc123xyz');
    captureReferralFromUrl();
    markReferralBonusGranted();
    expect(getReferralRecord()?.bonusGranted).toBe(true);
  });

  it('é no-op quando não há record', () => {
    markReferralBonusGranted();
    expect(getReferralRecord()).toBeNull();
  });
});

describe('getMyReferralLink / buildReferralShareText', () => {
  it('link contém ?ref= do próprio usuário', () => {
    const link = getMyReferralLink('/');
    const id = getMyReferralId();
    expect(link).toContain(`ref=${id}`);
  });

  it('share text inclui URL com ref', () => {
    const text = buildReferralShareText();
    const id = getMyReferralId();
    expect(text).toContain(id);
  });
});
