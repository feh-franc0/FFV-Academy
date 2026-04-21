'use client';

import { useEffect, useRef } from 'react';
import { awardBadge } from '@/lib/engine';

/**
 * Registra o service worker e concede o badge `pwa_installed` quando aplicável.
 *
 * Detecção dupla:
 * 1. Evento `appinstalled` — dispara na instalação do PWA.
 * 2. `display-mode: standalone` — reconhece sessão dentro do PWA já instalado.
 *
 * `awardBadge` é idempotente (guard em engine), mas ainda assim usamos
 * `useRef` pra evitar re-fires em StrictMode dev.
 */
export function PWARegister() {
  const awarded = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryAward = () => {
      if (awarded.current) return;
      awarded.current = true;
      awardBadge('pwa_installed');
    };

    const onInstalled = () => tryAward();
    window.addEventListener('appinstalled', onInstalled);

    try {
      const isStandalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) tryAward();
    } catch { /* matchMedia indisponível */ }

    const cleanupAppInstalled = () => window.removeEventListener('appinstalled', onInstalled);

    if (process.env.NODE_ENV !== 'production') return cleanupAppInstalled;
    if (!('serviceWorker' in navigator)) return cleanupAppInstalled;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(err => {
          if (typeof console !== 'undefined') console.warn('[PWA] SW registration failed:', err);
        });
    };

    if (document.readyState === 'complete') {
      onLoad();
      return cleanupAppInstalled;
    }
    window.addEventListener('load', onLoad);
    return () => {
      cleanupAppInstalled();
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}
