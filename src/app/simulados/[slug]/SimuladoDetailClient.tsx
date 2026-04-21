'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getSimulado } from '@/lib/simulados';
import { isPaidFor, grantProduct } from '@/lib/auth';
import { idFromSlug } from '@/components/SimuladoCard';
import { useState } from 'react';

interface Props {
  slug: string;
}

export function SimuladoDetailClient({ slug }: Props) {
  const router = useRouter();
  const { user, requireLogin, refresh } = useAuth();
  const [processing, setProcessing] = useState(false);

  const simuladoId = idFromSlug(slug);
  const simulado = getSimulado(simuladoId);

  if (!simulado) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-lg" style={{ color: 'var(--ffv-muted)' }}>Simulado não encontrado.</p>
        <Link href="/simulados" className="inline-block mt-6 text-sm font-semibold" style={{ color: 'var(--ffv-blue)' }}>
          ← Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const hasPaid = user ? isPaidFor(simuladoId) : false;
  const preview = simulado.questions[0];

  async function handleStart() {
    try {
      await requireLogin('fazer o simulado');
      router.push(`/simulados/${slug}/fazer`);
    } catch { /* cancelado */ }
  }

  async function handleUnlock() {
    try {
      await requireLogin('desbloquear o simulado');
      setProcessing(true);
      // TODO(backend): chamar POST /api/checkout → webhook Stripe confirma → grantProduct server-side.
      await new Promise(r => setTimeout(r, 700));
      grantProduct(simuladoId);
      refresh();
      setProcessing(false);
      router.push(`/simulados/${slug}/fazer`);
    } catch {
      setProcessing(false);
    }
  }

  const accent = simulado.comingSoon ? '#a371f7' : '#f78166';

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <Link href="/simulados" style={{ color: 'var(--ffv-muted)' }}>Simulados</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>{simulado.certification}</span>
      </nav>

      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accent }}>
          {simulado.certification}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{simulado.title}</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>{simulado.description}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Questões', value: simulado.questionCount },
          { label: 'Tempo', value: `${simulado.timeLimitMin} min` },
          { label: 'Mínimo', value: `${simulado.passingScore}%` },
          { label: 'Preço', value: simulado.comingSoon ? '—' : `R$ ${simulado.price}` },
        ].map(m => (
          <div key={m.label} className="p-4 rounded-xl text-center" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{m.label}</p>
            <p className="text-xl font-bold mt-1">{m.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Tópicos cobertos</h2>
        <div className="flex flex-wrap gap-2">
          {simulado.topics.map(t => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}40`, color: accent }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-10 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-3">👇 Questão de preview</h2>
        <p className="text-sm font-semibold mb-3">{preview.stem}</p>
        <div className="flex flex-col gap-2 mb-4">
          {preview.options.map(o => (
            <div key={o.id} className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
              <b style={{ color: accent }}>{o.id}.</b> {o.text}
            </div>
          ))}
        </div>
        <details className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <summary className="cursor-pointer font-semibold" style={{ color: accent }}>Ver explicação do tutor</summary>
          <p className="mt-2">
            <b>Resposta: {preview.correctId}</b>. {preview.explanation}
          </p>
        </details>
      </section>

      <section className="flex flex-col md:flex-row gap-3">
        {simulado.comingSoon ? (
          <div className="w-full p-5 rounded-xl text-center" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="text-lg font-bold mb-1">Em breve</p>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
              Por enquanto só o preview está disponível. Volta já já com 65 questões reais.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleStart}
              className="flex-1 px-5 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
            >
              Começar grátis (10 questões)
            </button>
            {!hasPaid ? (
              <button
                onClick={handleUnlock}
                disabled={processing}
                className="flex-1 px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                style={{ background: accent, color: '#0d1117' }}
              >
                {processing ? 'Processando…' : `Desbloquear por R$ ${simulado.price}`}
              </button>
            ) : (
              <span className="flex-1 px-5 py-3 rounded-xl font-semibold text-sm text-center" style={{ background: 'rgba(63,185,80,0.1)', color: 'var(--ffv-green)', border: '1px solid rgba(63,185,80,0.3)' }}>
                ✓ Você tem acesso completo
              </span>
            )}
          </>
        )}
      </section>
    </article>
  );
}
