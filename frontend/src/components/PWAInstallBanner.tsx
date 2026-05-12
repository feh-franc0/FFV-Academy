'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

const DISMISS_KEY = 'ffv:pwaInstallBannerDismissedAt';
const RE_SHOW_AFTER_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

/**
 * PWAInstallBanner — Aparece em mobile (Android Chrome principalmente) quando
 * o browser dispara `beforeinstallprompt`. Mostra banner sutil convidando a
 * instalar como PWA. iOS não dispara o evento — para isso, mostramos
 * instruções manuais ("Compartilhar > Tela de início").
 *
 * Persistência de dismissal: 14 dias.
 */
export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const dismissedAt = Number(raw);
      const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (days < RE_SHOW_AFTER_DAYS) return;
    }

    setDismissed(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
    track('cta_clicked', { id: 'pwa_install_dismiss' });
  }

  async function handleInstall() {
    if (!installPrompt) return;
    track('cta_clicked', { id: 'pwa_install_accept' });
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      handleDismiss();
    }
  }

  if (dismissed || !installPrompt) return null;

  return (
    <div
      role="region"
      aria-label="Instalar FFV Academy como app"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 p-4 rounded-2xl flex items-center gap-3 shadow-2xl"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--ffv-blue) 22%, var(--ffv-bg2)), var(--ffv-bg2))',
        border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
      }}
    >
      <span style={{ fontSize: 28 }} aria-hidden>
        📱
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Instalar FFV Academy</p>
        <p className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.4 }}>
          Acesso offline + experiência sem distrações
        </p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="px-3 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-[1.04]"
        style={{
          background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dispensar instalação"
        className="px-2 py-1 rounded-lg text-xs transition-colors"
        style={{
          background: 'transparent',
          color: 'var(--ffv-muted)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
}
