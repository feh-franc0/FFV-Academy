/**
 * Tests pro validador client-side em comment-api.ts.
 *
 * O backend é a fonte de verdade (CHECK constraint + handler reject), mas o
 * validador local fornece feedback instantâneo (sem round-trip) e DEVE
 * espelhar exatamente as regras do backend. Esses testes pegam drift entre
 * client/server validations.
 */
import { describe, it, expect } from 'vitest';
import { validateCommentLocally, COMMENT_MAX_CHARS } from '../comment-api';

describe('validateCommentLocally — char limits', () => {
  it('aceita conteúdo normal', () => {
    expect(validateCommentLocally('Excelente material, muito útil para entender atenção.').ok).toBe(true);
  });

  it('rejeita vazio', () => {
    const r = validateCommentLocally('');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/vazio/);
  });

  it('rejeita só espaços', () => {
    const r = validateCommentLocally('   \n  ');
    expect(r.ok).toBe(false);
  });

  it(`rejeita > ${COMMENT_MAX_CHARS} chars`, () => {
    const r = validateCommentLocally('a'.repeat(COMMENT_MAX_CHARS + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/1000/);
  });

  it(`aceita exatamente ${COMMENT_MAX_CHARS} chars`, () => {
    // 'a' repetido 1000 vezes tem char repeat — uso conteúdo realista no limit.
    // 'lorem ipsum dolor sit amet ' = 27 chars; *37 = 999; +' x' = 1001; slice =1000.
    const piece = 'lorem ipsum dolor sit amet ';
    const big = piece.repeat(Math.ceil(COMMENT_MAX_CHARS / piece.length)).slice(0, COMMENT_MAX_CHARS);
    expect(big.length).toBe(COMMENT_MAX_CHARS);
    expect(validateCommentLocally(big).ok).toBe(true);
  });
});

describe('validateCommentLocally — anti-spam URLs', () => {
  it('aceita 0 URLs', () => {
    expect(validateCommentLocally('texto sem nada').ok).toBe(true);
  });

  it('aceita 1 URL', () => {
    expect(validateCommentLocally('confira https://example.com').ok).toBe(true);
  });

  it('rejeita 2+ URLs', () => {
    const r = validateCommentLocally('vai em https://a.com e https://b.com');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/link/);
  });

  it('detecta bare domains (sem http)', () => {
    const r = validateCommentLocally('compre em site1.com e site2.com');
    expect(r.ok).toBe(false);
  });
});

describe('validateCommentLocally — char repeat', () => {
  it('rejeita 8+ chars iguais seguidos', () => {
    const r = validateCommentLocally('uauuuuuuuuu legal');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/caractere/);
  });

  it('aceita 7 chars iguais (limite)', () => {
    expect(validateCommentLocally('uauuuuuu legal mesmo').ok).toBe(true);
  });
});

describe('validateCommentLocally — all caps', () => {
  it('rejeita > 70% caps em strings ≥10 chars', () => {
    const r = validateCommentLocally('ISSO TUDO EM CAPS');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/CAIXA/);
  });

  it('aceita "OK" em caps (string curta)', () => {
    expect(validateCommentLocally('OK').ok).toBe(true);
  });

  it('aceita texto normal com algumas palavras em caps', () => {
    expect(validateCommentLocally('Use o algoritmo SM-2 do Anki, é bem testado.').ok).toBe(true);
  });

  it('aceita 70% maiúsculas (limite borderline)', () => {
    // "ABCDEFGabc" — 7 caps de 10 letras = 70%. Borderline (não > 70%).
    expect(validateCommentLocally('ABCDEFGabc').ok).toBe(true);
  });
});
