'use client';

/**
 * /questoes — lista os hubs disponíveis e o estado do banco de cada um.
 *
 * Banco vazio (hub sem arquivo registrado): mostra "Em construção".
 * Banco populado: mostra contagem total + distribuição easy/medium/hard +
 * botão "Praticar".
 *
 * Como adicionar conteúdo a um hub: ver instruções em
 * `frontend/src/lib/question-bank/index.ts` e arquivo exemplo
 * `hub-ia.example.ts`.
 */

import Link from 'next/link';
import { HUBS } from '@/lib/curriculum';
import { getBankForHub, countByDifficulty } from '@/lib/question-bank';

export function QuestoesClient() {
  const hubsWithStatus = HUBS.map(hub => {
    const bank = getBankForHub(hub.id);
    const counts = bank ? countByDifficulty(bank) : null;
    return { hub, bank, counts };
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Questões</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Banco de questões</h1>
        <p className="text-base md:text-lg max-w-3xl" style={{ color: 'var(--ffv-muted)' }}>
          100 questões por hub, separadas em <strong style={{ color: 'var(--ffv-green)' }}>fácil</strong>,{' '}
          <strong style={{ color: 'var(--ffv-yellow)' }}>médio</strong> e{' '}
          <strong style={{ color: 'var(--ffv-red, #dc2626)' }}>difícil</strong>.
          Adicional aos quizzes dos módulos — pra praticar de verdade depois
          que terminou de estudar a base.
        </p>
      </header>

      <section
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {hubsWithStatus.map(({ hub, bank, counts }) => {
          const populated = bank !== null && bank.questions.length > 0;
          return (
            <article
              key={hub.id}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${populated ? `${hub.color}40` : 'var(--ffv-border)'}`,
                opacity: populated ? 1 : 0.7,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center text-2xl"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${hub.color} 14%, transparent)`,
                    border: `1px solid ${hub.color}35`,
                  }}
                >
                  {hub.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate">{hub.name}</h3>
                  <p className="text-xs truncate" style={{ color: 'var(--ffv-muted)' }}>
                    {hub.shortName}
                  </p>
                </div>
              </div>

              {populated && counts ? (
                <>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: 'var(--ffv-green)' }}
                      />
                      {counts.easy} fácil
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: 'var(--ffv-yellow)' }}
                      />
                      {counts.medium} médio
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: 'var(--ffv-red, #dc2626)' }}
                      />
                      {counts.hard} difícil
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    {bank!.questions.length} questões no total
                  </p>
                  <Link
                    href={`/questoes/${hub.id}`}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold"
                    style={{ background: hub.color, color: '#fff' }}
                  >
                    Praticar →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
                    Banco em construção — 100 questões em breve. Por ora, pratique
                    dentro dos módulos do hub.
                  </p>
                  <Link
                    href={hub.href}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold"
                    style={{
                      background: 'var(--ffv-bg)',
                      border: '1px solid var(--ffv-border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    Ver módulos do hub →
                  </Link>
                </>
              )}
            </article>
          );
        })}
      </section>

      <aside
        className="mt-10 p-5 rounded-xl text-sm"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px dashed var(--ffv-border)',
          color: 'var(--ffv-muted)',
        }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          Por que 100 questões por hub?
        </p>
        <p className="leading-relaxed">
          Esse banco é <strong>adicional</strong> aos quizzes embutidos nos módulos.
          Os quizzes de cada módulo cobrem o conteúdo daquele artigo específico (7-10
          perguntas); o banco aqui é transversal — cobre o hub inteiro. Treina aplicação
          em contextos novos, o que ajuda mais a fixar do que reler.
        </p>
      </aside>
    </div>
  );
}
