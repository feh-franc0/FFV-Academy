/**
 * /revisar/maratona — configuração de sessão SRS focada.
 *
 * Permite escolher:
 *   - Quantos cards (5, 10, 20, 50, todos)
 *   - Trilha específica (ou todas)
 *
 * Após confirmar, ReviewClient é instanciado com props que filtram o queue.
 */
'use client';

import { useState } from 'react';
import { BackButton } from '@/components/BackButton';
import { CURRICULUM } from '@/lib/curriculum';
import { ReviewClient } from '@/components/ReviewClient';

const QTY_OPTIONS = [5, 10, 20, 50, 0]; // 0 = todos

function slugToTrail(slug: string): string | undefined {
  for (const trail of CURRICULUM) {
    if (trail.modules.some(m => m.slug === slug)) return trail.id;
  }
  return undefined;
}

export default function MaratonaPage() {
  const [qty, setQty] = useState<number>(20);
  const [trail, setTrail] = useState<string>('');
  const [started, setStarted] = useState(false);

  const trailName = trail ? CURRICULUM.find(t => t.id === trail)?.name ?? trail : '';

  if (started) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Maratona de revisão</h1>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
              {qty === 0 ? 'Todas as cartas due' : `${qty} cartas`}
              {/* nome da trilha, não o id — `trail` guarda 'trail-bedrock' e o
                  usuário selecionou "AWS Bedrock — GenAI em Produção" */}
              {trailName && ` · ${trailName}`}
            </p>
          </div>
          <button
            onClick={() => setStarted(false)}
            className="text-sm underline"
            style={{ color: 'var(--ffv-muted)' }}
          >
            Reconfigurar
          </button>
        </header>
        <ReviewClient
          maxCards={qty || undefined}
          trailFilter={trail || undefined}
          slugToTrail={slugToTrail}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <BackButton href="/revisar" className="inline-flex items-center gap-1.5 text-xs underline">
        Voltar para revisão padrão
      </BackButton>
      <h1 className="text-3xl font-bold mt-4 mb-2">Maratona de revisão</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ffv-muted)' }}>
        Configure uma sessão focada de SRS. Escolha quantos cards quer revisar
        e, opcionalmente, restrinja a uma trilha específica.
      </p>

      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Quantidade
        </h2>
        <div className="flex gap-2 flex-wrap">
          {QTY_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setQty(n)}
              className="px-4 py-2 rounded-md text-sm font-semibold"
              style={{
                background: qty === n ? 'var(--ffv-blue)' : 'var(--ffv-bg2)',
                color: qty === n ? 'white' : 'var(--foreground)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              {n === 0 ? 'Todos' : n}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Trilha (opcional)
        </h2>
        <select
          aria-label="Trilha (opcional)"
          value={trail}
          onChange={e => setTrail(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          <option value="">Todas as trilhas</option>
          {CURRICULUM.map(t => (
            <option key={t.id} value={t.id}>
              {t.name || t.id}
            </option>
          ))}
        </select>
      </section>

      <button
        onClick={() => setStarted(true)}
        className="w-full px-6 py-3 rounded-md text-base font-semibold"
        style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
      >
        Começar maratona
      </button>
    </div>
  );
}
