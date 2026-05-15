'use client';

import { useEffect, useState } from 'react';
import { getPlatformStats, type PlatformStats } from '@/lib/platform-stats';
import { colorForInitials } from '@/lib/avatar-color';

export function SocialProofBar() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlatformStats().then(s => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mensagem honesta enquanto não temos número alto.
  // Acima de 50 usuários reais → exibe número. Abaixo → mensagem genuína.
  const showRealNumber = stats !== null && stats.totalUsers >= 50;

  return (
    <section
      className="px-6 py-6"
      style={{
        borderTop: '1px solid var(--ffv-border)',
        borderBottom: '1px solid var(--ffv-border)',
        background: 'var(--ffv-bg2)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <AvatarStack />
          <div>
            <p className="text-sm font-semibold">
              {showRealNumber
                ? `${stats!.totalUsers.toLocaleString('pt-BR')}+ devs estudando aqui`
                : 'Primeira leva de devs já está estudando'}
            </p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              {showRealNumber && stats!.activeWeekly > 0
                ? `${stats!.activeWeekly} ativos esta semana`
                : 'Junte-se à comunidade que está se preparando para a nova era da IA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <Tag icon="⚡" label="100% gratuito" />
          <Tag icon="🔁" label="Revisão espaçada (SM-2)" />
          <Tag icon="🇧🇷" label="Conteúdo em PT-BR" />
        </div>
      </div>
    </section>
  );
}

function AvatarStack() {
  const initials = ['FV', 'AR', 'MS', 'JG', 'RP'];
  return (
    <div className="flex -space-x-2">
      {initials.map((init, i) => (
        <div
          key={init}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
          style={{
            background: colorForInitials(init),
            color: '#fff',
            borderColor: 'var(--ffv-bg2)',
            zIndex: initials.length - i,
          }}
        >
          {init}
        </div>
      ))}
    </div>
  );
}

function Tag({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="hidden md:inline-flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
