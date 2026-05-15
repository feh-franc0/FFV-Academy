/**
 * safeJsonLd — defesa contra XSS quando JSON é embebido inline em
 * <script type="application/ld+json">. O escape evita que payloads
 * dinâmicos fechem a tag <script> ou iniciem comentários HTML.
 */
import { describe, it, expect } from 'vitest';
import { safeJsonLd } from '../safe-json';

describe('safeJsonLd', () => {
  it('escapa < > & globalmente', () => {
    const out = safeJsonLd({ a: '<b>&"' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).not.toContain('&');
    expect(out).toContain('\\u003c');
    expect(out).toContain('\\u003e');
    expect(out).toContain('\\u0026');
  });

  it('neutraliza payload clássico </script><script>alert(1)</script>', () => {
    const out = safeJsonLd({ pwn: '</script><script>alert(1)</script>' });
    // Não pode existir nenhuma sequência que feche/abra <script> real.
    expect(out.toLowerCase()).not.toContain('</script');
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('escapa variante case-mix </ScRiPt>', () => {
    const out = safeJsonLd({ pwn: '</ScRiPt><ScRiPt>alert(1)</ScRiPt>' });
    expect(out).not.toMatch(/<\/?[sS][cC][rR][iI][pP][tT]/);
  });

  it('escapa <!-- (início de comentário HTML)', () => {
    const out = safeJsonLd({ x: '<!-- gotcha -->' });
    expect(out).not.toContain('<!--');
  });

  it('escapa U+2028 e U+2029 (line separators que quebram parsers legacy)', () => {
    const u2028 = ' ';
    const u2029 = ' ';
    const out = safeJsonLd({ a: `pre${u2028}mid${u2029}post` });
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(u2028);
    expect(out).not.toContain(u2029);
  });

  it('roundtrip: JSON.parse no output ainda recupera o valor original', () => {
    const value = { title: '</script>alert', body: 'a & b < c > d', u: ' ' };
    const out = safeJsonLd(value);
    expect(JSON.parse(out)).toEqual(value);
  });
});
