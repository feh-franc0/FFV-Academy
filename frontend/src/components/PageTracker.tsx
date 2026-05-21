'use client';

/**
 * PageTracker — envia um evento de view por TROCA DE PÁGINA (não só /aprenda).
 *
 * Antes de 2026-05-21 só tracávamos /aprenda/<slug> via ViewTracker. Admin
 * pediu visibilidade de TODAS as páginas — ranking, simulados, /admin/*,
 * home das bases — pra saber "quem acessou o quê". Este componente roda no
 * layout root e detecta mudanças via `usePathname` + `useSearchParams`.
 *
 * Categoriza automaticamente:
 *   - /aprenda/<slug>            → kind=module, slug extraído
 *   - /<base>/<slug> (medvet…)  → kind=module, slug extraído + baseSlug
 *   - /admin/...                → kind=admin
 *   - /simulados ou /<base>/simulado-* → kind=simulado
 *   - resto                     → kind=page
 *
 * Identidade injetada via headers `X-FFV-*` (vide lib/tracking.ts).
 *
 * Dedupe por sessão+path: a mesma sessão de browser não conta 2 pageviews
 * para o mesmo path (evita inflar admin views em refreshes).
 */
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { trackView, type ViewKind } from '@/lib/tracking';

function classifyPath(pathname: string): { kind: ViewKind; slug: string; baseSlug?: string } {
  if (pathname.startsWith('/admin')) {
    return { kind: 'admin', slug: pathname };
  }
  if (pathname.startsWith('/aprenda/')) {
    const slug = pathname.split('/')[2] ?? '';
    return { kind: 'module', slug, baseSlug: 'tecnologia' };
  }
  // Padrão /<baseSlug>/<modSlug> — ex.: /medicina-veterinaria/mod-mendel
  // Detecta heurística: 2 segmentos, segundo não é "simulado-..."
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length === 2) {
    const [maybeBase, maybeMod] = segs;
    if (maybeMod.startsWith('simulado-') || maybeMod === 'simulado') {
      return { kind: 'simulado', slug: maybeMod, baseSlug: maybeBase };
    }
    return { kind: 'module', slug: maybeMod, baseSlug: maybeBase };
  }
  // Home de base (/tecnologia, /medicina-veterinaria) — 1 seg
  if (segs.length === 1) {
    return { kind: 'page', slug: segs[0], baseSlug: segs[0] };
  }
  // /simulados raiz
  if (pathname.startsWith('/simulados')) {
    return { kind: 'simulado', slug: pathname };
  }
  return { kind: 'page', slug: pathname };
}

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { base: activeBase } = useActiveBase();

  useEffect(() => {
    if (!pathname) return;
    const c = classifyPath(pathname);
    // baseSlug efetivo: prioriza o que o context ActiveBase sabe, cai pro
    // heurístico do path (ex. quando o usuário cai numa página sem provider).
    const baseSlug = activeBase?.slug || c.baseSlug;
    const queryString = searchParams?.toString() ?? '';
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    trackView({
      slug: c.slug,
      baseSlug,
      path: fullPath,
      kind: c.kind,
      // Uma view por path por sessão (evita inflar contagem em re-mount).
      dedupeKey: pathname,
    });
  }, [pathname, searchParams, activeBase?.slug]);

  return null;
}
