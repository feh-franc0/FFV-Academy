/**
 * News imagery — fallback automático de imagens por categoria/source.
 *
 * Quando a notícia não tem `imageUrl` próprio, usamos Unsplash com query
 * pré-filtrada e dimensões fixas. Imagens da Unsplash não exigem API key
 * para o `images.unsplash.com/photo-X` (URLs estáveis e cacheáveis).
 *
 * As IDs abaixo foram escolhidas manualmente (curadoria, sem API call):
 * tem boa proporção 16:9, abstratas/futuristas, sem rostos identificáveis,
 * com licença Unsplash (uso comercial livre, sem atribuição obrigatória).
 *
 * Trocar imagem: substitua o ID. Para escolher novas, use
 * https://unsplash.com/s/photos/abstract-tech?orientation=landscape
 * e copie o ID após `/photos/`.
 */

import type { NewsCategory } from './news';

/** Imagens Unsplash por categoria — escolhidas para tom abstrato/tech. */
const CATEGORY_IMAGES: Record<NewsCategory, string[]> = {
  launch: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475', // circuit board macro
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', // matrix rain
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485', // robotic light
  ],
  research: [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb', // neural net abstract
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0', // data visualization
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71', // chart abstract
  ],
  business: [
    'https://images.unsplash.com/photo-1551434678-e076c223a692', // boardroom abstract
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', // money/data
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f', // analytics
  ],
  safety: [
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7', // shield/security
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3', // lock abstract
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', // alert tone
  ],
  regulation: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f', // legal/contract
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', // gavel-ish
    'https://images.unsplash.com/photo-1521791136064-7986c2920216', // government building
  ],
};

/** Hash determinístico simples — string → índice estável. */
function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/**
 * Retorna URL de imagem para a notícia. Se `item.imageUrl` existe, usa.
 * Caso contrário, escolhe determinísticamente uma imagem da categoria
 * baseada no `item.id` (mesmo item → mesma imagem em todos os renders).
 *
 * Adicionamos params `?w=800&q=80&fm=webp` para Unsplash servir versão
 * otimizada — economiza banda e melhora LCP.
 */
export function imageForItem(item: {
  id: string;
  category: NewsCategory;
  imageUrl?: string;
}): string {
  if (item.imageUrl) return item.imageUrl;
  const candidates = CATEGORY_IMAGES[item.category] ?? CATEGORY_IMAGES.launch;
  const base = candidates[hashIndex(item.id, candidates.length)];
  // Adiciona params Unsplash para CDN servir versão otimizada
  return `${base}?w=1200&q=80&fm=webp&auto=format&fit=crop`;
}
