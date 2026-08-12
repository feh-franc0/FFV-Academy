'use client';

import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { useEffect, useState } from 'react';
import { getSimulado, getExplanationText, type SimuladoQuestion } from '@/lib/simulados';
import { fetchQuestionsByIds } from '@/lib/clf-bank';
import { listAttemptsApi, claimXPCredit, type ScoreDTO } from '@/lib/simulados-api';
import { readAndClearResult, type StashedResult } from '@/lib/simulado-result-bridge';
import { idFromSlug } from '@/components/SimuladoCard';
import { completeSimulado } from '@/lib/engine';
import { useAuth } from '@/hooks/useAuth';
import { CertificateModal } from './CertificateModal';
import { PeerComparisonChip } from '@/components/peer/PeerComparisonChip';
import { calculatePeerPercentile } from '@/lib/peer-stats';
import { FalhaAoCarregar } from '@/components/estado/FalhaAoCarregar';

interface Props {
  slug: string;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'ready'; attemptId: string; score: ScoreDTO; weakTopics: string[]; answers: Record<string, string> };

/**
 * Score e weakTopics vêm do SERVIDOR (POST /attempts/{id}/finish), nunca mais
 * recalculados no cliente — é o ponto central do pack anti-fraude. A tela lê
 * o resultado por dois caminhos:
 *  1. Ponte via sessionStorage (SimuladoRunner acabou de finalizar) — tem
 *     tudo: score completo com byTopic, weakTopics, respostas.
 *  2. Fallback via listAttemptsApi (reload da página, link direto/salvo) —
 *     mais pobre (sem byTopic detalhado), mas não deixa a tela vazia.
 */
export function ResultadoClient({ slug }: Props) {
  const { user, requireLogin } = useAuth();
  const simuladoId = idFromSlug(slug);
  const simulado = getSimulado(simuladoId);

  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [reviewFailed, setReviewFailed] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [awardedBadges, setAwardedBadges] = useState<string[]>([]);
  const [showCert, setShowCert] = useState(false);

  function loadReview(ids: string[], dbBankId: string) {
    setReviewIds(ids);
    setReviewFailed(false);
    if (ids.length === 0) return;
    fetchQuestionsByIds(ids, dbBankId)
      .then(qs => setQuestions(qs))
      .catch(err => {
        console.error('ResultadoClient: falha ao buscar questões da revisão', err);
        setReviewFailed(true);
      });
  }

  useEffect(() => {
    if (!simulado) return;
    let cancelled = false;

    async function load() {
      const bridged: StashedResult | null = readAndClearResult(simuladoId);
      if (bridged) {
        if (!cancelled) {
          setState({
            kind: 'ready',
            attemptId: bridged.attemptId,
            score: bridged.score,
            weakTopics: bridged.weakTopics,
            answers: bridged.answers,
          });
          loadReview(bridged.questionIds, simulado!.dbBankId ?? simuladoId);
        }
        return;
      }

      // Fallback: sem ponte (reload/link direto) — busca a tentativa mais
      // recente finalizada deste simulado via /api/v1/attempts.
      try {
        const attempts = await listAttemptsApi();
        const match = attempts
          .filter(a => a.simuladoId === (simulado!.dbBankId ?? simuladoId) && a.finishedAt && a.id)
          .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''))[0];
        if (!match || !match.id || match.score === undefined) {
          if (!cancelled) setState({ kind: 'not-found' });
          return;
        }
        if (!cancelled) {
          setState({
            kind: 'ready',
            attemptId: match.id,
            score: { value: match.score, correct: 0, total: 0, passed: !!match.passed, byTopic: {} },
            weakTopics: [],
            answers: match.answers,
          });
          loadReview(Object.keys(match.answers), simulado!.dbBankId ?? simuladoId);
        }
      } catch (err) {
        console.error('ResultadoClient: falha ao buscar tentativas', err);
        if (!cancelled) setState({ kind: 'not-found' });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [simulado, simuladoId]);

  // Concede XP + badges uma única vez por attemptId — idempotência real,
  // garantida no SERVIDOR via `claimXPCredit` (xp_credited_at), não numa
  // chave em sessionStorage (que não é compartilhada entre abas e não
  // sobrevive a uma aba nova). Só concede XP localmente quando o servidor
  // confirma que ESTA foi a primeira reivindicação para o attemptId.
  useEffect(() => {
    if (state.kind !== 'ready' || !simulado) return;
    let cancelled = false;
    claimXPCredit(state.attemptId).then(({ claimed }) => {
      if (cancelled || !claimed) return;
      const result = completeSimulado({ simuladoId, score: state.score.value, passed: state.score.passed });
      setXpGained(result.xpGained);
      setAwardedBadges(result.newBadges);
    }).catch(err => console.error('ResultadoClient: falha ao reivindicar crédito de XP', err));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind]);

  if (!simulado) return <p className="px-6 py-20 text-center">Simulado não encontrado.</p>;

  if (state.kind === 'loading') {
    return (
      <div className="px-6 py-20 text-center" role="status" aria-live="polite">
        <p style={{ color: 'var(--ffv-muted)' }}>Carregando resultado…</p>
      </div>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--ffv-muted)' }}>Nenhum resultado encontrado.</p>
        <BackButton href={`/simulados/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold">
          Voltar ao detalhe
        </BackButton>
      </div>
    );
  }

  const { score, weakTopics, answers, attemptId } = state;

  async function handleEmitCert() {
    if (score.value < simulado!.passingScore) return;
    try {
      await requireLogin('emitir certificado');
      setShowCert(true);
    } catch { /* cancelado */ }
  }

  const accent = score.passed ? 'var(--ffv-green)' : '#f78166';

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
        <div className="text-6xl mb-3">{score.passed ? '🏆' : '📖'}</div>
        <div data-testid="score-value" className="text-6xl font-bold mb-2" style={{ color: accent }}>
          {score.value}%
        </div>
        <p className="text-lg font-semibold mb-1">
          {score.passed
            ? `Você passaria! (mínimo: ${simulado.passingScore}%)`
            : `Você precisa de ${simulado.passingScore}% para passar.`}
        </p>
        {score.total > 0 && (
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {score.correct}/{score.total} corretas
          </p>
        )}
        {(() => {
          const peer = calculatePeerPercentile(score.value, simulado.id);
          return <PeerComparisonChip score={peer.score} percentile={peer.percentile} />;
        })()}
        {xpGained !== null && (
          <p className="mt-4 text-xs font-semibold" style={{ color: 'var(--ffv-yellow)' }}>
            ⚡ +{xpGained} XP creditados
            {awardedBadges.length > 0 && ` · ${awardedBadges.length} novo${awardedBadges.length > 1 ? 's' : ''} badge`}
          </p>
        )}
      </header>

      {Object.keys(score.byTopic).length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Acertos por tópico</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(score.byTopic).map(([topic, { correct, total }]) => {
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
      )}

      {weakTopics.length > 0 && (
        <section className="mb-10 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <h2 className="text-lg font-bold mb-2">🎯 Pontos pra reforçar</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Seu desempenho foi abaixo de 70% em: <b>{weakTopics.join(', ')}</b>
          </p>
        </section>
      )}

      {questions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Revisão das questões</h2>
          <div className="flex flex-col gap-3">
            {[...questions]
              .sort((a, b) => {
                const aCorrect = answers[a.id] === a.correctId;
                const bCorrect = answers[b.id] === b.correctId;
                return Number(aCorrect) - Number(bCorrect);
              })
              .map(q => {
                const chosen = answers[q.id];
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
      )}

      {reviewFailed && (
        <section className="mb-10">
          <FalhaAoCarregar
            compact
            title="Não conseguimos carregar a revisão das questões"
            description="Seu resultado está salvo — só a revisão detalhada falhou ao carregar."
            onRetry={() => loadReview(reviewIds, simulado.dbBankId ?? simuladoId)}
          />
        </section>
      )}

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
          disabled={score.value < simulado.passingScore}
          className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          {score.value < simulado.passingScore
            ? `Atinja ${simulado.passingScore}% para emitir`
            : '🎓 Emitir certificado'}
        </button>
      </section>

      {showCert && user && (
        <CertificateModal
          simulado={simulado}
          user={user}
          score={score.value}
          attemptId={attemptId}
          onClose={() => setShowCert(false)}
        />
      )}
    </article>
  );
}
