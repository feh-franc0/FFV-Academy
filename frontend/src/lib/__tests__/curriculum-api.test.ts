/**
 * curriculum-api — cliente HTTP do CMS-driven.
 *
 * NOTA: o módulo lê `process.env.NEXT_PUBLIC_API_BASE_URL` em tempo de
 * import (const no topo). Para testar o happy path setamos a env ANTES de
 * importar dinamicamente. Cada teste re-importa para refletir a env atual.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const validResponse = {
  slug: 'o-que-e-ia',
  title: 'O que é IA',
  trail_id: 'trail-1',
  hub_id: 'ia',
  xp: 10,
  read_time: 5,
  difficulty: 'beginner',
  order: 1,
  updated_at: '2026-05-12T00:00:00Z',
  blocks: [
    {
      id: 'p1',
      type: 'paragraph',
      position: 0,
      data: { content: [{ text: 'hi' }] },
    },
  ],
};

async function loadModule(envBase: string | undefined) {
  if (envBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = envBase;
  vi.resetModules();
  return await import('../curriculum-api');
}

describe('curriculum-api.fetchArticleWithBlocks', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('200 OK + JSON válido → retorna ArticleWithBlocks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200, json: async () => validResponse,
    } as Response)));
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocks('o-que-e-ia');
    expect(out).toBeTruthy();
    expect(out?.slug).toBe('o-que-e-ia');
    expect(out?.blocks).toHaveLength(1);
  });

  it('sem NEXT_PUBLIC_API_BASE_URL → retorna null sem chamar fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { fetchArticleWithBlocks } = await loadModule(undefined);
    const out = await fetchArticleWithBlocks('x');
    expect(out).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('404 → retorna null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 404, json: async () => ({}),
    } as Response)));
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocks('nao-existe');
    expect(out).toBeNull();
  });

  it('500 → retorna null e loga warning', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 500, json: async () => ({}),
    } as Response)));
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocks('boom');
    expect(out).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it('JSON inválido (falha Zod) → retorna null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200, json: async () => ({ slug: 'x' }),
    } as Response)));
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocks('x');
    expect(out).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('exceção de rede → retorna null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }));
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocks('x');
    expect(out).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('encodeURIComponent é aplicado no slug', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true, status: 200, json: async () => validResponse,
    } as Response));
    vi.stubGlobal('fetch', fetchSpy);
    const { fetchArticleWithBlocks } = await loadModule('http://api.test');
    await fetchArticleWithBlocks('foo bar/baz');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('foo%20bar%2Fbaz'),
      expect.any(Object),
    );
  });
});

/**
 * `fetchArticleWithBlocksResult` é o que `/aprenda/[slug]` usa para decidir
 * 404 real vs "conteúdo indisponível" — a distinção que faltava e derrubava
 * as 490 páginas de módulo em 404 quando o backend só estava fora do ar.
 * `not-found` só pode vir do HTTP 404 explícito; qualquer outra falha é
 * `error`, nunca `not-found`.
 */
describe('curriculum-api.fetchArticleWithBlocksResult', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('200 OK → status ok com o artigo', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200, json: async () => validResponse,
    } as Response)));
    const { fetchArticleWithBlocksResult } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocksResult('o-que-e-ia');
    expect(out.status).toBe('ok');
    if (out.status === 'ok') expect(out.article.slug).toBe('o-que-e-ia');
  });

  it('404 explícito do backend → status not-found (NUNCA error)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 404, json: async () => ({}),
    } as Response)));
    const { fetchArticleWithBlocksResult } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocksResult('nao-existe');
    expect(out.status).toBe('not-found');
  });

  it('500 do backend → status error (NUNCA not-found)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 500, json: async () => ({}),
    } as Response)));
    const { fetchArticleWithBlocksResult } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocksResult('boom');
    expect(out.status).toBe('error');
  });

  it('exceção de rede (backend fora do ar) → status error, não not-found', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED'); }));
    const { fetchArticleWithBlocksResult } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocksResult('x');
    expect(out.status).toBe('error');
  });

  it('payload inválido (Zod falha) → status error, não not-found', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200, json: async () => ({ slug: 'x' }),
    } as Response)));
    const { fetchArticleWithBlocksResult } = await loadModule('http://api.test');
    const out = await fetchArticleWithBlocksResult('x');
    expect(out.status).toBe('error');
  });

  it('sem NEXT_PUBLIC_API_BASE_URL → status error sem chamar fetch (build/CI)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { fetchArticleWithBlocksResult } = await loadModule(undefined);
    const out = await fetchArticleWithBlocksResult('x');
    expect(out.status).toBe('error');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
