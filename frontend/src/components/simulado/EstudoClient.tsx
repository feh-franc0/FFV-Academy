'use client';

/**
 * EstudoClient — modo de estudo livre Cloud Practitioner.
 *
 * Sem timer, sem score persistente, sem paywall: o usuário recebe uma questão
 * aleatória do banco unificado CLF (distribuição weighted por domínio do
 * blueprint oficial), responde, vê a explicação rica e pode tirar dúvida via
 * <TutorAsk />.
 *
 * Histórico da sessão (acertos/erros últimas 20 questões) fica só em memória —
 * não polui localStorage e nem afeta o XP/streak do game state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { SimuladoQuestion, OptionId } from '@/lib/simulados';
import { fetchOneRandomQuestion } from '@/lib/clf-bank';
import { FEATURES } from '@/lib/features';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { TutorAsk } from './TutorAsk';

const TUTOR_AVAILABLE = FEATURES.tutorAI;

type Phase = 'selecting' | 'answered';

interface SessionEntry {
  questionId: string;
  domain: string;
  correct: boolean;
}

interface RichExplanation {
  summary?: string;
  whyCorrect?: string;
  whyWrong?: Partial<Record<OptionId, string>>;
  keyConcept?: string;
  compareWith?: string[];
  commonMistakes?: string[];
  tutorSeeds?: string[];
}

function getRich(question: SimuladoQuestion): RichExplanation | null {
  if (typeof question.explanation === 'string') return null;
  return question.explanation as unknown as RichExplanation;
}

export function EstudoClient() {
  const router = useRouter();
  const { isLoggedIn, requireLogin } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current, setCurrent] = useState<SimuladoQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('selecting');
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [session, setSession] = useState<SessionEntry[]>([]);
  const [tutorOpen, setTutorOpen] = useState(false);
  // IDs vistos na sessão — passados ao backend como excludeIds para evitar repetição.
  const seenIdsRef = useRef<string[]>([]);

  // Gate de login (endpoint requer JWT).
  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin('estudar livremente').catch(() => router.push('/simulados'));
    }
  }, [isLoggedIn, requireLogin, router]);

  const fetchNext = useCallback(async (exclude: string[]) => {
    setLoading(true);
    try {
      let picked = await fetchOneRandomQuestion({ excludeIds: exclude });
      // Se o backend devolver vazio, esgotou o banco com aqueles filtros:
      // reabre o pool zerando o exclude.
      if (!picked && exclude.length > 0) {
        seenIdsRef.current = [];
        picked = await fetchOneRandomQuestion({});
      }
      if (!picked) {
        setLoadError('Não há questões disponíveis no banco. Verifique se o seed foi rodado.');
        return;
      }
      setCurrent(picked);
      setSelected(null);
      setPhase('selecting');
      setTutorOpen(false);
    } catch {
      setLoadError('Não consegui carregar a próxima questão. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Primeira questão ao logar.
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNext([]);
  }, [isLoggedIn, fetchNext]);

  const next = useCallback(() => {
    fetchNext(seenIdsRef.current);
  }, [fetchNext]);

  const confirm = useCallback(() => {
    if (!current || !selected) return;
    setPhase('answered');
    // Adiciona à lista de IDs vistos — usado como excludeIds na próxima busca.
    seenIdsRef.current = [...seenIdsRef.current, current.id].slice(-100);
    setSession(prev => {
      const entry: SessionEntry = {
        questionId: current.id,
        domain: current.topic,
        correct: selected === current.correctId,
      };
      return [...prev, entry].slice(-20);
    });
  }, [current, selected]);

  const stats = useMemo(() => {
    if (session.length === 0) return null;
    const correct = session.filter(s => s.correct).length;
    const byDomain: Record<string, { total: number; correct: number }> = {};
    for (const s of session) {
      if (!byDomain[s.domain]) byDomain[s.domain] = { total: 0, correct: 0 };
      byDomain[s.domain].total += 1;
      if (s.correct) byDomain[s.domain].correct += 1;
    }
    return {
      total: session.length,
      correct,
      pct: Math.round((correct / session.length) * 100),
      byDomain,
    };
  }, [session]);

  if (loadError) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-sm" role="alert">{loadError}</div>;
  }

  if (loading || !current) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-sm" style={{ color: 'var(--ffv-muted)' }} aria-live="polite">
        Carregando questão...
      </div>
    );
  }

  const rich = getRich(current);
  const correctOption = current.options.find(o => o.id === current.correctId);
  const isCorrect = phase === 'answered' && selected === current.correctId;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/simulados" style={{ color: 'var(--ffv-muted)' }}>Simulados</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Estudo livre Cloud Practitioner</span>
      </nav>

      <header className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: '#f78166' }}>
          AWS CLF-C02 · Estudo livre
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Estudo livre — Cloud Practitioner</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Sem timer. Sem score. Sem pressão. Questões sorteadas do banco completo CLF respeitando a distribuição oficial do blueprint AWS.
        </p>
      </header>

      {stats && (
        <section
          className="mb-6 p-4 rounded-xl flex flex-wrap items-center gap-4 text-xs"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          aria-label="Progresso da sessão"
        >
          <span><b>{stats.correct}/{stats.total}</b> certas ({stats.pct}%)</span>
          <span style={{ color: 'var(--ffv-muted)' }}>·</span>
          {Object.entries(stats.byDomain).map(([d, v]) => (
            <span key={d} style={{ color: 'var(--ffv-muted)' }}>
              {d}: {v.correct}/{v.total}
            </span>
          ))}
        </section>
      )}

      <section
        className="p-6 rounded-xl mb-6"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-mono uppercase tracking-widest">
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,129,102,0.12)', color: '#f78166' }}>
            {current.topic}
          </span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)' }}>
            {current.difficulty}
          </span>
        </div>

        <h2 className="text-base md:text-lg font-medium mb-5 leading-relaxed">{current.stem}</h2>

        <ul className="space-y-2" role="radiogroup" aria-label="Opções de resposta">
          {current.options.map(opt => {
            const isSelected = selected === opt.id;
            const isAnsweredCorrect = phase === 'answered' && opt.id === current.correctId;
            const isAnsweredWrong = phase === 'answered' && isSelected && opt.id !== current.correctId;

            let bg = 'var(--ffv-bg)';
            let border = 'var(--ffv-border)';
            if (isAnsweredCorrect) { bg = 'rgba(46,160,67,0.12)'; border = '#2ea043'; }
            else if (isAnsweredWrong) { bg = 'rgba(248,81,73,0.12)'; border = '#f85149'; }
            else if (isSelected) { border = '#f78166'; }

            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={phase === 'answered'}
                  onClick={() => setSelected(opt.id)}
                  className="w-full text-left p-3 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
                  style={{ background: bg, border: `1px solid ${border}`, color: 'var(--foreground)' }}
                >
                  <span className="font-mono font-bold mr-2">{opt.id}.</span>
                  {opt.text}
                </button>
              </li>
            );
          })}
        </ul>

        {phase === 'selecting' && (
          <button
            onClick={confirm}
            disabled={!selected}
            className="mt-5 px-5 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: '#f78166', color: '#fff' }}
          >
            Confirmar resposta
          </button>
        )}
      </section>

      {phase === 'answered' && (
        <section className="space-y-3 mb-6" aria-label="Explicação">
          <div
            className="p-4 rounded-xl text-sm font-medium"
            style={{
              background: isCorrect ? 'rgba(46,160,67,0.12)' : 'rgba(248,81,73,0.12)',
              border: `1px solid ${isCorrect ? '#2ea043' : '#f85149'}`,
            }}
          >
            {isCorrect
              ? `Acertou! Resposta correta: ${current.correctId}.`
              : `A correta era ${current.correctId}${correctOption ? ` — ${correctOption.text}` : ''}.`}
          </div>

          {rich ? <RichExplanationBlock rich={rich} options={current.options} /> : <PlainExplanationBlock text={String(current.explanation)} />}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => TUTOR_AVAILABLE && setTutorOpen(true)}
              disabled={!TUTOR_AVAILABLE}
              title={TUTOR_AVAILABLE ? undefined : 'Tutor IA disponível em breve (requer NEXT_PUBLIC_FEATURE_TUTOR_AI_ENABLED=true + backend Anthropic configurado)'}
              aria-disabled={!TUTOR_AVAILABLE}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid #f78166', color: '#f78166' }}
            >
              {TUTOR_AVAILABLE ? 'Tire minha dúvida' : '💤 Tutor IA em breve'}
            </button>
            <button
              onClick={next}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#f78166', color: '#fff' }}
            >
              Próxima questão →
            </button>
          </div>
        </section>
      )}

      <TutorAsk
        question={current}
        userAnswer={selected ?? undefined}
        open={tutorOpen}
        onClose={() => setTutorOpen(false)}
      />
    </div>
  );
}

function PlainExplanationBlock({ text }: { text: string }) {
  return (
    <div
      className="p-4 rounded-xl text-sm leading-relaxed"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      {text}
    </div>
  );
}

function RichExplanationBlock({ rich, options }: { rich: RichExplanation; options: SimuladoQuestion['options'] }) {
  return (
    <div className="space-y-3">
      {rich.summary && (
        <div
          className="p-4 rounded-xl text-sm leading-relaxed font-medium"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          {rich.summary}
        </div>
      )}

      {rich.whyCorrect && (
        <div
          className="p-4 rounded-xl text-sm leading-relaxed"
          style={{ background: 'rgba(46,160,67,0.08)', border: '1px solid rgba(46,160,67,0.4)' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#2ea043' }}>
            Por que está certo
          </p>
          {rich.whyCorrect}
        </div>
      )}

      {rich.whyWrong && Object.keys(rich.whyWrong).length > 0 && (
        <div className="space-y-2">
          {options.map(opt => {
            const reason = rich.whyWrong?.[opt.id];
            if (!reason) return null;
            return (
              <div
                key={opt.id}
                className="p-3 rounded-xl text-sm leading-relaxed"
                style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.3)' }}
              >
                <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: '#f85149' }}>
                  Por que {opt.id} está errada
                </p>
                {reason}
              </div>
            );
          })}
        </div>
      )}

      {(rich.keyConcept || rich.compareWith?.length) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {rich.keyConcept && (
            <span
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(88,166,255,0.12)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.3)' }}
            >
              Conceito-chave: {rich.keyConcept}
            </span>
          )}
          {rich.compareWith?.map((c, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
            >
              Compare com: {c}
            </span>
          ))}
        </div>
      )}

      {rich.commonMistakes && rich.commonMistakes.length > 0 && (
        <div
          className="p-4 rounded-xl text-sm leading-relaxed"
          style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.3)' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#ffc107' }}>
            Erros comuns
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {rich.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
