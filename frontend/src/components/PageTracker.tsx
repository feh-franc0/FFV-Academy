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
import { getBaseBySlug } from '@/lib/bases/registry';
import { getBaseSlugForModule } from '@/lib/bases/module-base-resolver';

function classifyPath(pathname: string): { kind: ViewKind; slug: string; baseSlug?: string } {
  // /admin/* — NUNCA tem base. Não herdar do context.
  if (pathname.startsWith('/admin')) {
    return { kind: 'admin', slug: pathname };
  }

  // /aprenda/<slug> — infere base via resolver (módulo conhece sua base).
  // Antes: hardcoded 'tecnologia' — bug que poluía o admin com tudo virando Tecnologia.
  if (pathname.startsWith('/aprenda/')) {
    const slug = pathname.split('/')[2] ?? '';
    const inferred = getBaseSlugForModule(slug);
    return { kind: 'module', slug, baseSlug: inferred ?? undefined };
  }

  // /simulados raiz — kind=simulado, sem base.
  if (pathname.startsWith('/simulados')) {
    return { kind: 'simulado', slug: pathname };
  }

  const segs = pathname.split('/').filter(Boolean);

  // / — marketing global.
  if (segs.length === 0) {
    return { kind: 'page', slug: '/' };
  }

  // /<seg> — só vira baseSlug se for base CONHECIDA no registry.
  // Antes: assumia cego que segs[0] era base, poluindo com /bases, /ranking, /sobre.
  if (segs.length === 1) {
    const slug = segs[0];
    if (getBaseBySlug(slug)) {
      return { kind: 'page', slug, baseSlug: slug };
    }
    return { kind: 'page', slug: pathname };
  }

  // /<base>/<slug> — 2 segmentos. Só assume base+módulo se o primeiro for base conhecida.
  if (segs.length === 2) {
    const [maybeBase, maybeMod] = segs;
    if (getBaseBySlug(maybeBase)) {
      if (maybeMod.startsWith('simulado-') || maybeMod === 'simulado') {
        return { kind: 'simulado', slug: maybeMod, baseSlug: maybeBase };
      }
      return { kind: 'module', slug: maybeMod, baseSlug: maybeBase };
    }
    // Não é base conhecida (ex: /sobre/equipe). Marketing/global.
    return { kind: 'page', slug: pathname };
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

    // baseSlug: classifyPath é autoritativo. activeBase só entra como FALLBACK
    // pra rotas de aprendizado (module/simulado) quando o classify não inferiu —
    // útil pra rotas legadas tipo /ia/intro, /aws/clf-c02. NUNCA herdar pra admin
    // (admin não tem base) nem pra páginas marketing/global (que classify resolveu como sem base).
    const baseSlug = c.baseSlug
      ?? ((c.kind === 'module' || c.kind === 'simulado') ? activeBase?.slug : undefined);

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
