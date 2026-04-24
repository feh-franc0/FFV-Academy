/**
 * News — schema Zod, helpers puros e integridade do feed curado.
 *
 * Garantimos:
 * - Schema rejeita entrada inválida (URL não-https, data malformada, categoria fora do enum)
 * - sortByDateDesc é estável e determinística
 * - filtros por source/category isolam corretamente
 * - relativeDate produz strings em pt-BR
 * - O JSON curado em src/data/news.json passa no schema (integridade de build)
 */

import { describe, it, expect } from 'vitest';
import {
  NewsItemSchema,
  NewsFeedSchema,
  sortByDateDesc,
  filterBySource,
  filterByCategory,
  uniqueSources,
  relativeDate,
  brandFor,
  loadNewsFeed,
  type NewsItem,
} from '../../lib/news';

const VALID_ITEM: NewsItem = {
  id: 'claude-opus-launch',
  title: 'Claude Opus 4.7 chega com janela estendida',
  summary: 'Um resumo suficientemente longo para passar na validação mínima do schema.',
  source: 'Anthropic',
  sourceUrl: 'https://www.anthropic.com/news',
  publishedAt: '2026-04-18',
  category: 'launch',
  hot: true,
  tags: ['claude', 'opus'],
};

describe('NewsItemSchema', () => {
  it('aceita item válido', () => {
    expect(NewsItemSchema.safeParse(VALID_ITEM).success).toBe(true);
  });

  it('rejeita URL não-https (bloqueia mixed content)', () => {
    const bad = { ...VALID_ITEM, sourceUrl: 'http://evil.example/news' };
    expect(NewsItemSchema.safeParse(bad).success).toBe(false);
  });

  it('rejeita data em formato inválido', () => {
    const bad = { ...VALID_ITEM, publishedAt: '18/04/2026' };
    expect(NewsItemSchema.safeParse(bad).success).toBe(false);
  });

  it('rejeita categoria fora do enum', () => {
    const bad = { ...VALID_ITEM, category: 'hype' as unknown as NewsItem['category'] };
    expect(NewsItemSchema.safeParse(bad).success).toBe(false);
  });

  it('rejeita id fora do padrão kebab-case', () => {
    const bad = { ...VALID_ITEM, id: 'CamelCase-Not-Allowed!' };
    expect(NewsItemSchema.safeParse(bad).success).toBe(false);
  });

  it('rejeita título excessivamente curto', () => {
    const bad = { ...VALID_ITEM, title: 'Curto' };
    expect(NewsItemSchema.safeParse(bad).success).toBe(false);
  });
});

describe('sortByDateDesc', () => {
  it('ordena do mais recente para o mais antigo', () => {
    const items: NewsItem[] = [
      { ...VALID_ITEM, id: 'a', publishedAt: '2026-04-10' },
      { ...VALID_ITEM, id: 'b', publishedAt: '2026-04-18' },
      { ...VALID_ITEM, id: 'c', publishedAt: '2026-04-15' },
    ];
    const sorted = sortByDateDesc(items);
    expect(sorted.map(i => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('desempata por id quando datas são iguais (determinismo)', () => {
    const items: NewsItem[] = [
      { ...VALID_ITEM, id: 'z', publishedAt: '2026-04-18' },
      { ...VALID_ITEM, id: 'a', publishedAt: '2026-04-18' },
    ];
    const sorted = sortByDateDesc(items);
    expect(sorted.map(i => i.id)).toEqual(['a', 'z']);
  });

  it('não muta o array original', () => {
    const items: NewsItem[] = [
      { ...VALID_ITEM, id: 'a', publishedAt: '2026-04-10' },
      { ...VALID_ITEM, id: 'b', publishedAt: '2026-04-18' },
    ];
    const before = items.map(i => i.id);
    sortByDateDesc(items);
    expect(items.map(i => i.id)).toEqual(before);
  });
});

describe('filtros', () => {
  const items: NewsItem[] = [
    { ...VALID_ITEM, id: 'a', source: 'Anthropic', category: 'launch' },
    { ...VALID_ITEM, id: 'b', source: 'OpenAI', category: 'launch' },
    { ...VALID_ITEM, id: 'c', source: 'Anthropic', category: 'research' },
  ];

  it('filtra por source', () => {
    expect(filterBySource(items, 'Anthropic').map(i => i.id)).toEqual(['a', 'c']);
  });

  it('passa através quando source é null', () => {
    expect(filterBySource(items, null)).toHaveLength(3);
  });

  it('filtra por category', () => {
    expect(filterByCategory(items, 'research').map(i => i.id)).toEqual(['c']);
  });

  it('retorna fontes únicas ordenadas por frequência', () => {
    const sources = uniqueSources(items);
    expect(sources[0]).toBe('Anthropic'); // 2 items
    expect(sources).toContain('OpenAI');
  });
});

describe('relativeDate', () => {
  it('retorna "hoje" no mesmo dia', () => {
    const now = new Date('2026-04-20T12:00:00Z');
    expect(relativeDate('2026-04-20', now)).toBe('hoje');
  });

  it('retorna "ontem" com 1 dia de diferença', () => {
    const now = new Date('2026-04-20T12:00:00Z');
    expect(relativeDate('2026-04-19', now)).toBe('ontem');
  });

  it('retorna "há N dias" dentro de uma semana', () => {
    const now = new Date('2026-04-20T12:00:00Z');
    expect(relativeDate('2026-04-16', now)).toBe('há 4 dias');
  });

  it('retorna "há N semanas" após uma semana', () => {
    const now = new Date('2026-04-30T12:00:00Z');
    expect(relativeDate('2026-04-14', now)).toMatch(/há 2 semanas/);
  });
});

describe('brandFor', () => {
  it('retorna cor de marca conhecida', () => {
    const b = brandFor('Anthropic');
    expect(b.from).toMatch(/^#[0-9a-f]{6}$/i);
    expect(b.to).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('cai no Default para fonte desconhecida', () => {
    const b = brandFor('FonteQueNaoExiste');
    expect(b).toBeDefined();
    expect(b.from).toMatch(/^#/);
  });
});

describe('feed curado (integridade)', () => {
  it('passa no NewsFeedSchema', () => {
    const feed = loadNewsFeed();
    const parsed = NewsFeedSchema.safeParse(feed);
    expect(parsed.success).toBe(true);
  });

  it('tem pelo menos 15 notícias curadas', () => {
    const feed = loadNewsFeed();
    expect(feed.items.length).toBeGreaterThanOrEqual(15);
  });

  it('todos os ids são únicos', () => {
    const feed = loadNewsFeed();
    const ids = feed.items.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todas as URLs são https', () => {
    const feed = loadNewsFeed();
    for (const item of feed.items) {
      expect(item.sourceUrl.startsWith('https://')).toBe(true);
    }
  });
});
