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
                ? `${stats!.totalUsers.toLocaleString('pt-BR')}+ devs construindo com IA aqui`
                : 'Faça parte da primeira leva de devs da FFV'}
            </p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              {showRealNumber && stats!.activeWeekly > 0
                ? `${stats!.activeWeekly} ativos esta semana`
                : 'A comunidade de quem aprende a construir com IA de verdade — em PT-BR'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <Tag icon="🎯" label="Foco: IA, Claude & AWS" />
          <Tag icon="⚡" label="100% gratuito, sem paywall" />
          <Tag icon="🔁" label="Revisão espaçada (SM-2)" />
          <Tag icon="🇧🇷" label="Em PT-BR" />
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
            // Os acentos da paleta são CLAROS (amarelo, verde-menta, lilás):
            // branco sobre eles mede 1,66:1 a 2,52:1. O fundo escuro da marca é
            // o par legível de todos os cinco, nos dois temas.
            color: '#0d1117',
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
