'use client';

/**
 * TrailStatsTable — visão tabular do progresso por trilha.
 *
 * Para cada trilha mostra:
 *   - % completo (módulos done / total)
 *   - Quiz accuracy avg (média de score/total nos quizzes da trilha)
 *   - XP estimado conquistado na trilha
 *   - Status (Não iniciado / Em progresso / Concluído)
 *
 * Sem fetch — tudo local do GameState. Performance: O(trails × modules).
 */
import Link from 'next/link';
import { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CURRICULUM, getTrailHref } from '@/lib/curriculum';

interface TrailStat {
  id: string;
  name: string;
  total: number;
  done: number;
  percent: number;
  quizAccuracy: number | null; // 0-1 ou null se sem quizzes feitos
  quizCount: number;
  xpEstimated: number;
  status: 'completed' | 'in-progress' | 'not-started';
  href: string;
}

export function TrailStatsTable() {
  const { state } = useGameState();

  const stats = useMemo<TrailStat[]>(() => {
    if (!state) return [];
    const completed = new Set(state.completedModules);
    const quizScores = state.quizScores ?? {};

    return CURRICULUM.map(trail => {
      const total = trail.modules.length;
      let done = 0;
      let xp = 0;
      let scoreSum = 0;
      let scoreMax = 0;
      let quizCount = 0;

      for (const m of trail.modules) {
        if (completed.has(m.slug)) {
          done++;
          xp += m.xp ?? 0;
        }
        const q = quizScores[m.slug];
        if (q && q.total > 0) {
          scoreSum += q.score;
          scoreMax += q.total;
          quizCount++;
        }
      }

      const percent = total === 0 ? 0 : Math.round((done / total) * 100);
      const status: TrailStat['status'] = done === 0 ? 'not-started' : done === total ? 'completed' : 'in-progress';

      return {
        id: trail.id,
        name: trail.name || trail.id,
        total,
        done,
        percent,
        quizAccuracy: scoreMax > 0 ? scoreSum / scoreMax : null,
        quizCount,
        xpEstimated: xp,
        status,
        // getTrailHref já retorna '/' como fallback seguro; o ?? '/trilha/<id>'
        // antigo nunca disparava (string nunca é nullish) e teria dado 404 se
        // disparasse — não existe rota /trilha/ no app router.
        href: getTrailHref(trail.id),
      };
    }).sort((a, b) => {
      // Ordena: em progresso primeiro (descrescente por percent), depois concluídas, depois não iniciadas.
      const order = { 'in-progress': 0, completed: 1, 'not-started': 2 } as const;
      const da = order[a.status] - order[b.status];
      if (da !== 0) return da;
      return b.percent - a.percent;
    });
  }, [state]);

  if (!state || stats.length === 0) return null;

  return (
    <section className="mt-8">
      <header className="mb-4">
        <h2 className="text-lg font-bold">Stats por trilha</h2>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Progresso, quiz accuracy e XP estimado em cada trilha do currículo.
        </p>
      </header>

      <div
        tabIndex={0}
        role="group"
        aria-label="Stats por trilha, rolável na horizontal"
        className="rounded-xl overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]"
        style={{ border: '1px solid var(--ffv-border)' }}
      >
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Trilha</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Progresso</th>
              <th className="px-3 py-2 text-left font-semibold">Quiz acc</th>
              <th className="px-3 py-2 text-left font-semibold">XP</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: i < stats.length - 1 ? '1px solid var(--ffv-border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                }}
              >
                <td className="px-3 py-2">
                  <Link href={s.href} className="inline-flex items-center min-h-[24px] font-semibold hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      background:
                        s.status === 'completed'
                          ? 'var(--ffv-green, #16a34a)'
                          : s.status === 'in-progress'
                            ? 'var(--ffv-blue)'
                            : 'var(--ffv-bg2)',
                      color:
                        s.status === 'not-started' ? 'var(--ffv-muted)' : 'var(--primary-foreground)',
                      border: s.status === 'not-started' ? '1px solid var(--ffv-border)' : 'none',
                    }}
                  >
                    {s.status === 'completed' ? '✓ concluída' : s.status === 'in-progress' ? 'em progresso' : 'não iniciada'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--ffv-bg2)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${s.percent}%`,
                          background: s.status === 'completed' ? 'var(--ffv-green, #16a34a)' : 'var(--ffv-blue)',
                        }}
                      />
                    </div>
                    <span className="font-mono">
                      {s.done}/{s.total}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono">
                  {s.quizAccuracy === null ? (
                    <span style={{ color: 'var(--ffv-muted)' }}>—</span>
                  ) : (
                    <span>
                      {Math.round(s.quizAccuracy * 100)}%{' '}
                      <span className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
                        ({s.quizCount}q)
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono">{s.xpEstimated.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
