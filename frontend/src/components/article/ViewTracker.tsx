'use client';

/**
 * ViewTracker — dispara 1 POST /api/v1/events/view por sessão por slug.
 *
 * Dedupe via sessionStorage: a mesma sessão de navegador não envia 2 pings
 * pro mesmo slug. Fire-and-forget — falha de rede é silenciosa, nunca afeta
 * UX. anonId vem do localStorage pra correlacionar visitas anônimas.
 */
import { useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const KEY = 'ffv_anon_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export function ViewTracker({ slug, hubId, trailId }: { slug: string; hubId?: string; trailId?: string }) {
  useEffect(() => {
    if (!API_BASE || !slug || typeof window === 'undefined') return;

    const key = `ffv_viewed_${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage indisponível — segue sem dedupe
    }

    const payload = {
      slug,
      hubId: hubId ?? '',
      trailId: trailId ?? '',
      anonId: getOrCreateAnonId(),
    };

    // Beacon API quando disponível — não bloqueia unload. Fallback fetch.
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE}/api/v1/events/view`, blob);
        return;
      }
    } catch {
      // segue para fetch
    }
    fetch(`${API_BASE}/api/v1/events/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // ignore network errors
    });
  }, [slug, hubId, trailId]);

  return null;
}
