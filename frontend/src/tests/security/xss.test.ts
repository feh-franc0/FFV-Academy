/**
 * Testes de segurança — XSS (Cross-Site Scripting).
 *
 * Cenários cobertos:
 * - Payload XSS em ?ref= da URL (é bloqueado antes de entrar no localStorage)
 * - Payload XSS em nome do usuário (Certificate) — é tratado como texto via Canvas API
 * - Import de state com payload XSS em strings (Zod + strict)
 * - `renderMarkdown` (sink de dangerouslySetInnerHTML em /cheatsheets/[slug])
 *
 * Observação corrigida em 11/ago/2026 (achado da auditoria de segurança): o
 * comentário anterior aqui dizia "o site é SSG 100% estático e não usa
 * dangerouslySetInnerHTML com conteúdo de usuário" — não é mais verdade desde
 * a migração pra SSR standalone. Existem hoje ~20 sinks de
 * `dangerouslySetInnerHTML` no projeto: a maioria é JSON-LD escapado via
 * `safeJsonLd`, e um (cheatsheets do CMS) passa por `renderMarkdown`, testado
 * abaixo. `sanitizeHTML`/`sanitizeText` (`lib/sanitize.ts`, DOMPurify) são
 * NO-OP em Server Component — DOMPurify precisa de `window`, que não existe
 * no servidor — então não protegem o sink de cheatsheet; a defesa real ali é
 * o escape-antes-da-estrutura dentro do próprio `renderMarkdown`.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { captureReferralFromUrl, getReferralRecord } from '../../lib/referral';
import { importState } from '../../lib/engine';
import { renderMarkdown } from '../../lib/markdown';

function setUrl(search: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, search },
  });
}

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '"><svg/onload=alert(1)>',
  "'; DROP TABLE users; --",
  '\u003cscript\u003ealert(1)\u003c/script\u003e',
  '%3Cscript%3Ealert(1)%3C/script%3E',
];

describe('XSS — parâmetro ?ref= é sanitizado', () => {
  beforeEach(() => localStorage.clear());

  it.each(XSS_PAYLOADS)('bloqueia payload: %s', payload => {
    setUrl(`?ref=${encodeURIComponent(payload)}`);
    const result = captureReferralFromUrl();
    expect(result).toBeNull();
    expect(getReferralRecord()).toBeNull();
  });
});

describe('XSS — localStorage não armazena HTML', () => {
  beforeEach(() => localStorage.clear());

  it('refId salvo preserva whitelist (nunca HTML)', () => {
    setUrl('?ref=abc123xyz');
    captureReferralFromUrl();
    const stored = localStorage.getItem('ffv_referral') || '';
    expect(stored).not.toContain('<');
    expect(stored).not.toContain('javascript:');
  });
});

describe('XSS — importState rejeita payloads maliciosos em campos tipados', () => {
  beforeEach(() => localStorage.clear());

  it('rejeita xp como string contendo HTML', async () => {
    const bad = JSON.stringify({
      schemaVersion: 1,
      xp: '<script>alert(1)</script>',
      level: 1, streak: 0, lastStudyDate: null,
      completedModules: [], quizScores: {}, badges: [],
      totalStudyTime: 0, startedAt: null,
      reviewCards: [], archivedCards: [], studyDays: [],
      freezes: 0, dailyGoal: 3, lastReviewDate: null,
      lastArticle: null, preferredHub: null,
      onboardedAt: null, articleProgress: {},
    });
    const r = await importState(bad);
    expect(r.ok).toBe(false);
  });

  it('aceita strings legítimas em campos string (são auto-escapadas pelo React)', async () => {
    // Strings são permitidas em `preferredHub`, `slug`, etc. O isolamento contra
    // XSS vem do auto-escape do React quando renderiza `{state.preferredHub}`.
    // Aqui apenas validamos que passam pela Zod — o teste de render em integration.
    const ok = JSON.stringify({
      xp: 10, level: 1, streak: 0, lastStudyDate: null,
      completedModules: ['<script>'], quizScores: {}, badges: [],
      totalStudyTime: 0, startedAt: null,
      reviewCards: [], archivedCards: [], studyDays: [],
      freezes: 0, dailyGoal: 3, lastReviewDate: null,
      lastArticle: null, preferredHub: '<img>',
      onboardedAt: null, articleProgress: {},
    });
    const r = await importState(ok);
    // Zod passa — React precisa fazer o escape.
    // (Validamos no teste de integração que isso não vira DOM attacker-controlled.)
    expect(r.ok).toBe(true);
  });
});

describe('XSS — renderMarkdown (sink dangerouslySetInnerHTML em /cheatsheets/[slug])', () => {
  // O renderer só gera um conjunto FIXO de tags (h1-h3, p, ul/ol/li, strong,
  // em, code, pre, a) — nenhuma delas é script/img/svg. Então a checagem que
  // importa é "nenhuma dessas tags aparece CRUA (não-escapada)", não "a
  // palavra onerror não aparece em lugar nenhum": `&lt;img ... onerror=...&gt;`
  // é texto inerte, com "onerror=" presente como STRING mas fora de qualquer
  // atributo HTML real — um browser não executa isso.
  function hasLiveDangerousTag(html: string): boolean {
    return /<(script|img|svg|iframe|object|embed)(?!\s+class="language)[\s>]/i.test(html);
  }

  it.each(XSS_PAYLOADS)('neutraliza payload em parágrafo: %s', payload => {
    const html = renderMarkdown(payload);
    expect(hasLiveDangerousTag(html)).toBe(false);
  });

  it('neutraliza <script> em qualquer posição estrutural (heading, lista, code fence)', () => {
    const md = [
      '# <script>alert(1)</script>',
      '- <img src=x onerror=alert(2)>',
      '```js',
      '</script><script>alert(3)</script>',
      '```',
    ].join('\n');
    const html = renderMarkdown(md);
    expect(hasLiveDangerousTag(html)).toBe(false);
    // As tags viram texto escapado, não elementos — confirma que não é só
    // ausência por coincidência de regex.
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
  });

  it('link com javascript: vira "#", não a URL original', () => {
    const html = renderMarkdown('[clique aqui](javascript:alert(1))');
    expect(html).not.toMatch(/href="javascript:/i);
    expect(html).toMatch(/href="#"/);
  });

  it('link http(s) e relativo continuam funcionando (não é um blocklist geral)', () => {
    expect(renderMarkdown('[a](https://example.com)')).toMatch(/href="https:\/\/example\.com"/);
    expect(renderMarkdown('[a](/aprenda/x)')).toMatch(/href="\/aprenda\/x"/);
  });

  it('aspas na URL do link não escapam o atributo href (a URL já vem escapada)', () => {
    // A ordem importa: escapeHtml roda ANTES do regex de link, então um `"`
    // bruto na URL já virou `&quot;` quando o regex de link a captura — não
    // sobra aspas crua pra fechar o atributo href="..." mais cedo.
    const html = renderMarkdown('[x](https://evil.com"onmouseover="alert(1))');
    expect(html).not.toMatch(/onmouseover=(?!.*&quot;)/i);
  });

  it('conteúdo legítimo continua renderizando normalmente', () => {
    const html = renderMarkdown('# Título\n\nUm **parágrafo** com `código` e [link](/x).');
    expect(html).toContain('<h1>Título</h1>');
    expect(html).toContain('<strong>parágrafo</strong>');
    expect(html).toContain('<code>código</code>');
    expect(html).toContain('href="/x"');
  });
});
