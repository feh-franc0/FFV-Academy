/**
 * News — portal de notícias curadas de IA.
 *
 * Fonte de dados: `src/data/news.json` (curadoria editorial manual).
 * Não depende de API externa — zero custo, zero CORS, zero API key.
 * Atualização: editar o JSON e rebuild (ou futuramente GitHub Action agendada).
 *
 * Schema validado em Zod porque o JSON pode ser editado por humano ou gerado
 * por pipeline externa no futuro — tratar como boundary input.
 */

import { z } from 'zod';
import newsData from '@/data/news.json';

export const NEWS_CATEGORIES = [
  'launch',
  'research',
  'business',
  'safety',
  'regulation',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  launch: 'Lançamento',
  research: 'Pesquisa',
  business: 'Negócios',
  safety: 'Safety',
  regulation: 'Regulação',
};

/**
 * Cores de marca por fonte. Usadas para gradiente de fundo do card.
 * Fontes desconhecidas caem no default neutro.
 */
export const SOURCE_BRAND: Record<string, { from: string; to: string }> = {
  Anthropic:   { from: '#cc785c', to: '#7a3f28' },
  OpenAI:      { from: '#10a37f', to: '#0b5f4a' },
  Google:      { from: '#4285f4', to: '#1a478f' },
  DeepMind:    { from: '#4285f4', to: '#1a478f' },
  Meta:        { from: '#0081fb', to: '#004a90' },
  Microsoft:   { from: '#0078d4', to: '#003a66' },
  NVIDIA:      { from: '#76b900', to: '#3f6600' },
  AWS:         { from: '#ff9900', to: '#995c00' },
  Mistral:     { from: '#ff7000', to: '#99430a' },
  DeepSeek:    { from: '#4d6bfe', to: '#283c99' },
  HuggingFace: { from: '#ff9d00', to: '#a66600' },
  Apple:       { from: '#007aff', to: '#003f85' },
  Perplexity:  { from: '#20808d', to: '#124953' },
  Cursor:      { from: '#8a8a8a', to: '#4a4a4a' },
  xAI:         { from: '#2d2d2d', to: '#000000' },
  Sakana:      { from: '#ff6b35', to: '#a33b16' },
  Research:    { from: '#7c3aed', to: '#3f1d80' },
  Industry:    { from: '#64748b', to: '#334155' },
  EU:          { from: '#003399', to: '#001a4d' },
  Default:     { from: '#58a6ff', to: '#1f4a80' },
};

export function brandFor(source: string) {
  return SOURCE_BRAND[source] ?? SOURCE_BRAND.Default;
}

const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'data inválida (YYYY-MM-DD)');

const HttpsUrlSchema = z
  .string()
  .url()
  .refine(u => u.startsWith('https://'), 'URL deve ser https://');

export const NewsItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{3,80}$/, 'id deve ser kebab-case'),
  title: z.string().min(10).max(140),
  summary: z.string().min(20).max(320),
  source: z.string().min(2).max(40),
  sourceUrl: HttpsUrlSchema,
  publishedAt: IsoDateSchema,
  category: z.enum(NEWS_CATEGORIES),
  hot: z.boolean().optional(),
  tags: z.array(z.string().min(2).max(32)).max(6).optional(),
  /** URL HTTPS de imagem de capa (opcional, Unsplash/autoral). */
  imageUrl: HttpsUrlSchema.optional(),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsFeedSchema = z.object({
  updatedAt: IsoDateSchema,
  items: z.array(NewsItemSchema).min(1).max(200),
});

export type NewsFeed = z.infer<typeof NewsFeedSchema>;

/**
 * Carrega o feed validado a partir do JSON local. Mantido como fallback
 * offline quando o backend CMS não está disponível em build/dev.
 */
export function loadNewsFeed(): NewsFeed {
  return NewsFeedSchema.parse(newsData);
}

interface BackendNewsItem {
  slug: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  category: string;
  hot?: boolean;
  tags?: string[];
  publishedAt: string;
}

function backendToFrontend(b: BackendNewsItem): NewsItem {
  // Backend usa "slug"; o tipo legacy frontend chama de "id".
  return {
    id: b.slug,
    title: b.title,
    summary: b.summary,
    source: b.source,
    sourceUrl: b.sourceUrl,
    imageUrl: b.imageUrl,
    category: (b.category as NewsCategory) ?? 'launch',
    hot: !!b.hot,
    tags: b.tags ?? [],
    publishedAt: b.publishedAt,
  };
}

/**
 * Versão async — busca do backend CMS. Usada por Server Components em build
 * time. Sem NEXT_PUBLIC_API_BASE_URL ou em falha de rede, cai pro JSON local.
 */
export async function loadNewsFeedAsync(): Promise<NewsFeed> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (!apiBase) {
    return loadNewsFeed();
  }
  try {
    const res = await fetch(`${apiBase}/api/v1/news?limit=200`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return loadNewsFeed();
    const body = (await res.json()) as { data?: BackendNewsItem[] };
    const items = (body.data ?? []).map(backendToFrontend);
    if (items.length === 0) return loadNewsFeed();
    return {
      updatedAt: items[0].publishedAt,
      items,
    };
  } catch {
    return loadNewsFeed();
  }
}

export function sortByDateDesc(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    if (a.publishedAt === b.publishedAt) return a.id.localeCompare(b.id);
    return a.publishedAt < b.publishedAt ? 1 : -1;
  });
}

export function filterBySource(items: NewsItem[], source: string | null): NewsItem[] {
  if (!source) return items;
  return items.filter(i => i.source === source);
}

export function filterByCategory(items: NewsItem[], category: NewsCategory | null): NewsItem[] {
  if (!category) return items;
  return items.filter(i => i.category === category);
}

/** Fontes únicas ordenadas por frequência descendente. */
export function uniqueSources(items: NewsItem[]): string[] {
  const count = new Map<string, number>();
  for (const it of items) count.set(it.source, (count.get(it.source) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
}

/** "há 3 dias" / "há 2h" em pt-BR. Base = data opcional para testes determinísticos. */
export function relativeDate(publishedAt: string, now: Date = new Date()): string {
  const then = new Date(publishedAt + 'T00:00:00Z');
  const diffMs = now.getTime() - then.getTime();
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `há ${w} semana${w !== 1 ? 's' : ''}`;
  }
  const m = Math.floor(days / 30);
  if (m < 12) return `há ${m} mês${m !== 1 ? 'es' : ''}`;
  const y = Math.floor(days / 365);
  return `há ${y} ano${y !== 1 ? 's' : ''}`;
}
