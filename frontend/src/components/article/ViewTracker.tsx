'use client';

/**
 * ViewTracker — dispara 1 POST /api/v1/events/view por sessão por slug,
 * com identificação via headers X-FFV-* (lib/tracking.ts).
 *
 * Histórico:
 *   - Antes de 2026-05-21: enviava só anonId no body, sem identificar
 *     usuário logado, sem baseSlug. Admin não conseguia ver quem viu o quê.
 *   - Agora: delega pra `trackView` que monta headers identificados
 *     (X-FFV-User-Email, X-FFV-Anon-Id, X-FFV-Session-Id, etc.).
 *
 * Continua útil em /aprenda/<slug>/page.tsx pra registrar com kind=module
 * explícito + hub/trail metadata. Para outras páginas, o PageTracker global
 * no layout já cobre.
 */
import { useEffect } from 'react';
import { trackView } from '@/lib/tracking';

export function ViewTracker({
  slug,
  hubId,
  trailId,
  baseSlug,
}: {
  slug: string;
  hubId?: string;
  trailId?: string;
  baseSlug?: string;
}) {
  useEffect(() => {
    if (!slug) return;
    trackView({
      slug,
      hubId,
      trailId,
      baseSlug,
      kind: 'module',
      dedupeKey: slug,
    });
  }, [slug, hubId, trailId, baseSlug]);

  return null;
}
