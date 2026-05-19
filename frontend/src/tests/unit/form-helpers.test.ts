import { describe, it, expect } from 'vitest';
import { maskBrazilianPhone, unmaskPhone, suggestEmailDomain } from '@/lib/form-helpers';

describe('maskBrazilianPhone', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['11987', '(11) 987'],
    ['1198765', '(11) 9876-5'],
    ['11987654', '(11) 9876-54'],
    ['119876543', '(11) 9876-543'],
    ['1198765432', '(11) 9876-5432'],
    ['11987654321', '(11) 98765-4321'],
    // Já formatado: re-aplicar é idempotente
    ['(11) 98765-4321', '(11) 98765-4321'],
    // Lixo aceito + ignorado (símbolos e letras)
    ['11abc987!@654#321', '(11) 98765-4321'],
    // Trunca após 11 dígitos
    ['11987654321999', '(11) 98765-4321'],
  ])('mask(%j) → %j', (input, expected) => {
    expect(maskBrazilianPhone(input)).toBe(expected);
  });
});

describe('unmaskPhone', () => {
  it('extrai dígitos', () => {
    expect(unmaskPhone('(11) 98765-4321')).toBe('11987654321');
    expect(unmaskPhone('')).toBe('');
    expect(unmaskPhone('abc')).toBe('');
  });
});

describe('suggestEmailDomain', () => {
  it('sugere correção de typo conhecido (gmial.com → gmail.com)', () => {
    expect(suggestEmailDomain('user@gmial.com')).toBe('user@gmail.com');
    expect(suggestEmailDomain('foo@hotmial.com')).toBe('foo@hotmail.com');
    expect(suggestEmailDomain('baz@outlok.com')).toBe('baz@outlook.com');
  });

  it('sugere correção via levenshtein-1 (gmaol.com → gmail.com)', () => {
    expect(suggestEmailDomain('user@gmaol.com')).toBe('user@gmail.com');
    expect(suggestEmailDomain('user@hotnail.com')).toBe('user@hotmail.com');
  });

  it('retorna null pra domínios já corretos', () => {
    expect(suggestEmailDomain('user@gmail.com')).toBeNull();
    expect(suggestEmailDomain('foo@yahoo.com.br')).toBeNull();
  });

  it('retorna null pra emails malformados', () => {
    expect(suggestEmailDomain('semarroba')).toBeNull();
    expect(suggestEmailDomain('user@')).toBeNull();
    expect(suggestEmailDomain('@gmail.com')).toBeNull();
    expect(suggestEmailDomain('')).toBeNull();
  });

  it('retorna null pra domínios muito distantes (≠1 caractere)', () => {
    expect(suggestEmailDomain('user@empresa.com.br')).toBeNull();
    expect(suggestEmailDomain('user@xpto.io')).toBeNull();
  });

  it('é case-insensitive', () => {
    expect(suggestEmailDomain('User@GMIAL.COM')).toBe('user@gmail.com');
  });
});
