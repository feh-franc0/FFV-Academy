'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSimulado, getAttempt, scoreAttempt, getWeakTopics, getExplanationText, type SimuladoAttempt, type SimuladoQuestion } from '@/lib/simulados';
import { fetchQuestionsByIds } from '@/lib/clf-bank';
import { getJSON } from '@/lib/storage';
import { idFromSlug } from '@/components/SimuladoCard';
import { completeSimulado } from '@/lib/engine';
import { useAuth } from '@/hooks/useAuth';
import { CertificateModal } from './CertificateModal';
import { PeerComparisonChip } from '@/components/peer/PeerComparisonChip';
import { calculatePeerPercentile } from '@/lib/peer-stats';

const simQsKey = (id: string) => `ffv_sim_qs_${id}`;

interface Props {
  slug: string;
}

export function ResultadoClient({ slug }: Props) {
  const { user, requireLogin } = useAuth();
  const simuladoId = idFromSlug(slug);
  const simulado = getSimulado(simuladoId);

  const [attempt, setAttempt] = useState<SimuladoAttempt | null>(null);
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [awardedBadges, setAwardedBadges] = useState<string[]>([]);
  const [showCert, setShowCert] = useState(false);

  // Carrega questões do banco usando IDs persistidos pelo SimuladoRunner.
  useEffect(() => {
    if (!simulado) return;
    const storedIds = getJSON<string[]>(simQsKey(simuladoId), null);
    if (!storedIds || storedIds.length === 0) return;
    fetchQuestionsByIds(storedIds, simuladoId)
      .then(found => {
        if (found.length > 0) setQuestions(found);
      })
      .catch(err => {
        console.error('ResultadoClient: falha ao buscar questões do attempt', err);
      });
  }, [simulado, simuladoId]);

  useEffect(() => {
    if (!simulado) return;
    const a = getAttempt(simuladoId);
    if (!a) return;
    setAttempt(a);
    // Concede XP + badges apenas uma vez (quando attempt tem finishedAt mas ainda não creditado).
    const CREDITED_KEY = `ffv_simulado_credited_${simuladoId}`;
    if (a.finishedAt && !sessionStorage.getItem(CREDITED_KEY)) {
      // Usa score salvo pelo SimuladoRunner (calculado com questões corretas); recalcula se ausente
      const score = a.score ?? scoreAttempt(simulado, a).score;
      const passed = a.passed ?? score >= simulado.passingScore;
      const result = completeSimulado({ simuladoId, score, passed });
      setXpGained(result.xpGained);
      setAwardedBadges(result.newBadges);
      sessionStorage.setItem(CREDITED_KEY, '1');
    }
  }, [simulado, simuladoId]);

  const scored = useMemo(() => {
    if (!simulado || !attempt) return null;
    if (attempt.score !== undefined && attempt.passed !== undefined) {
      // Score calculado com questões corretas — recalcula byTopic para exibição
      const sim = { ...simulado, questions };
      return scoreAttempt(sim, attempt);
    }
    return scoreAttempt({ ...simulado, questions }, attempt);
  }, [simulado, attempt, questions]);

  const weakTopics = useMemo(
    () => simulado && attempt ? getWeakTopics(attempt, { ...simulado, questions }) : [],
    [simulado, attempt, questions],
  );

  if (!simulado) return <p className="px-6 py-20 text-center">Simulado não encontrado.</p>;
  if (!attempt || !scored) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--ffv-muted)' }}>Nenhum resultado encontrado.</p>
        <Link href={`/simulados/${slug}`} className="text-sm font-semibold" style={{ color: 'var(--ffv-blue)' }}>
          ← Voltar ao detalhe
        </Link>
      </div>
    );
  }

  async function handleEmitCert() {
    if (!scored) return;
    if (scored.score < simulado!.passingScore) return;
    try {
      await requireLogin('emitir certificado');
      setShowCert(true);
    } catch { /* cancelado */ }
  }

  const accent = scored.passed ? 'var(--ffv-green)' : '#f78166';

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/simulados" style={{ color: 'var(--ffv-muted)' }}>Simulados</Link>
        <span className="mx-1">/</span>
        <Link href={`/simulados/${slug}`} style={{ color: 'var(--ffv-muted)' }}>{simulado.title}</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Resultado</span>
      </nav>

      <header className="text-center mb-10 p-8 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}40` }}>
        <div className="text-6xl mb-3">{scored.passed ? '🏆' : '📖'}</div>
        <div className="text-6xl font-bold mb-2" style={{ color: accent }}>
          {scored.score}%
        </div>
        <p className="text-lg font-semibold mb-1">
          {scored.passed
            ? `Você passaria! (mínimo: ${simulado.passingScore}%)`
            : `Você precisa de ${simulado.passingScore}% para passar.`}
        </p>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {scored.correctCount}/{questions.length} corretas
        </p>
        {(() => {
          const peer = calculatePeerPercentile(scored.score, simulado.id);
          return <PeerComparisonChip score={peer.score} percentile={peer.percentile} />;
        })()}
        {xpGained !== null && (
          <p className="mt-4 text-xs font-semibold" style={{ color: 'var(--ffv-yellow)' }}>
            ⚡ +{xpGained} XP creditados
            {awardedBadges.length > 0 && ` · ${awardedBadges.length} novo${awardedBadges.length > 1 ? 's' : ''} badge`}
          </p>
        )}
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">Acertos por tópico</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(scored.byTopic).map(([topic, { correct, total }]) => {
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            const strong = pct >= 70;
            const color = strong ? 'var(--ffv-green)' : '#f78166';
            return (
              <div key={topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--ffv-muted)' }}>{topic}</span>
                  <span style={{ color }}>{correct}/{total} · {pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ffv-bg2)' }}>
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {weakTopics.length > 0 && (
        <section className="mb-10 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <h2 className="text-lg font-bold mb-2">🎯 Pontos pra reforçar</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Seu desempenho foi abaixo de 70% em: <b>{weakTopics.join(', ')}</b>
          </p>
          <button
            disabled
            className="text-sm px-4 py-2 rounded-lg opacity-60 cursor-not-allowed"
            style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
          >
            Gerar questões extras — em breve
          </button>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">Revisão das questões</h2>
        <div className="flex flex-col gap-3">
          {[...questions]
            .sort((a, b) => {
              const aCorrect = attempt.answers[a.id] === a.correctId;
              const bCorrect = attempt.answers[b.id] === b.correctId;
              return Number(aCorrect) - Number(bCorrect);
            })
            .map(q => {
              const chosen = attempt.answers[q.id];
              const correct = chosen === q.correctId;
              return (
                <details key={q.id} className="rounded-xl p-4" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${correct ? 'rgba(63,185,80,0.3)' : 'rgba(247,129,102,0.3)'}` }}>
                  <summary className="cursor-pointer text-sm font-semibold">
                    {correct ? '✅' : '❌'} {q.stem}
                  </summary>
                  <div className="mt-3 text-xs">
                    <p style={{ color: 'var(--ffv-muted)' }}>
                      Sua resposta: <b>{chosen ?? 'não respondida'}</b> · Correta: <b style={{ color: 'var(--ffv-green)' }}>{q.correctId}</b>
                    </p>
                    <p className="mt-2">{getExplanationText(q.explanation)}</p>
                  </div>
                </details>
              );
            })}
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-3">
        <Link
          href={`/simulados/${slug}`}
          className="flex-1 text-center py-3 rounded-xl font-semibold text-sm"
          style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
        >
          ← Voltar
        </Link>
        <button
          onClick={handleEmitCert}
          disabled={scored.score < simulado.passingScore}
          className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
        >
          {scored.score < simulado.passingScore
            ? `Atinja ${simulado.passingScore}% para emitir`
            : '🎓 Emitir certificado'}
        </button>
      </section>

      {showCert && user && (
        <CertificateModal
          simulado={simulado}
          user={user}
          score={scored.score}
          onClose={() => setShowCert(false)}
        />
      )}
    </article>
  );
}
