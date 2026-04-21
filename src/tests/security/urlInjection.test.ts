/**
 * Testes de segurança — URL injection em parâmetros controlados.
 *
 * Cenários:
 * - open-redirect via link com ref (não existe — link vai sempre para fernandofrancovalle.com)
 * - Sobrecarga de query strings
 * - Unicode confusável
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { captureReferralFromUrl, getMyReferralLink } from '../../lib/referral';

function setUrl(search: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, search },
  });
}

describe('Open-redirect — getMyReferralLink', () => {
  it('sempre aponta para o domínio próprio', () => {
    const link = getMyReferralLink('/maliciouspath');
    expect(link.startsWith('https://fernandofrancovalle.com')).toBe(true);
  });

  it('ignora tentativas de passar URL absoluta como targetPath', () => {
    const link = getMyReferralLink('https://evil.com/xss');
    // URL constructor com base resolve como path se começar com /,
    // OU retorna uma URL igual se já absoluta. Garantimos origin correto:
    const url = new URL(link);
    expect(url.origin).toBe('https://fernandofrancovalle.com');
  });
});

describe('Unicode confusable em refId', () => {
  beforeEach(() => localStorage.clear());

  it('bloqueia chars homoglyph (cirílico) fora do whitelist ASCII', () => {
    // 'а' é cirílico, parece latino 'a'
    setUrl('?ref=' + encodeURIComponent('аbc123'));
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('bloqueia full-width characters', () => {
    // 'ａ' é fullwidth
    setUrl('?ref=' + encodeURIComponent('ａbc123'));
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('bloqueia zero-width joiners', () => {
    setUrl('?ref=' + encodeURIComponent('abc\u200Dxyz'));
    expect(captureReferralFromUrl()).toBeNull();
  });
});

describe('Query flood — captureReferralFromUrl não trava', () => {
  beforeEach(() => localStorage.clear());

  it('trata URL com ?ref= ausente silenciosamente', () => {
    setUrl('?foo=bar&baz=qux');
    expect(captureReferralFromUrl()).toBeNull();
  });

  it('trata URL com múltiplos ?ref= (primeiro vence)', () => {
    setUrl('?ref=abc123&ref=def456');
    expect(captureReferralFromUrl()).toBe('abc123');
  });
});
