'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DailyModule } from '@/lib/dailyModule';
import { useGameState } from '@/hooks/useGameState';

/**
 * Card "Módulo do Dia" — desafio compartilhado por todos os usuários.
 * Aparece quando o usuário NÃO já completou esse módulo hoje.
 */
export function DailyModuleCard() {
  const [daily, setDaily] = useState<DailyModule | null>(null);
  const { state } = useGameState();

  useEffect(() => {
    // Import dinâmico: `dailyModule.ts` importa `CURRICULUM` completo (~92 KB
    // gz) porque `onlyBeginnerOrIntermediate` filtra por `Module.level`, campo
    // ausente do índice leve. Este card renderiza na HOME, então estático ele
    // levava o currículo inteiro para a rota de maior tráfego do site. Roda só
    // depois do mount — SSR já não precisava do valor síncrono.
    let ativo = true;
    import('@/lib/dailyModule').then(({ getDailyModule }) => {
      if (ativo) setDaily(getDailyModule({ onlyBeginnerOrIntermediate: true }));
    });
    return () => { ativo = false; };
  }, []);

  if (!daily) return null;

  // Não mostrar se já completou hoje OU se está nos completedModules
  const alreadyCompleted = daily.completed || (state?.completedModules.includes(daily.slug) ?? false);
  if (alreadyCompleted) return null;

  return (
    <section className="px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/aprenda/${daily.slug}?source=daily-module`}
          className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.005]"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${daily.trailColor} 14%, var(--ffv-bg2)), var(--ffv-bg2))`,
            border: `1px solid ${daily.trailColor}40`,
          }}
        >
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>🌅</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${daily.trailColor}20`, color: daily.trailColor, border: `1px solid ${daily.trailColor}40` }}
                >
                  Módulo do Dia
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
                <span>⏱ {daily.readTime} min</span>
                <span>·</span>
                <span style={{ color: daily.trailColor, fontWeight: 700 }}>+{daily.xp + daily.bonusXp} XP</span>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              {daily.title}
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
              da trilha <span style={{ color: daily.trailColor, fontWeight: 600 }}>{daily.trailName}</span> · todos os usuários veem o mesmo desafio hoje
            </p>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: 'color-mix(in srgb, var(--ffv-yellow) 15%, transparent)', color: 'var(--ffv-yellow)', border: '1px solid color-mix(in srgb, var(--ffv-yellow) 40%, transparent)' }}
              >
                🎁 +{daily.bonusXp} XP bônus se completar hoje
              </span>
              <span
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{ background: daily.trailColor, color: '#0d1117' }}
              >
                Aceitar desafio →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
