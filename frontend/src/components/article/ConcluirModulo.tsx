'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
// Import type-only — apagado no runtime, então não custa bundle. O VALOR
// (`trilha`) chega como prop já resolvida pelo Server Component
// (`/aprenda/[slug]/page.tsx`, que já chama `getTrailForModule` para o
// JSON-LD). Até 11/ago/2026 este componente re-derivava a mesma trilha
// client-side com `CURRICULUM.find(...)` — CURRICULUM completo (~92 KB gz)
// em TODA página de artigo, 490 delas, só para reencontrar 1 trilha que o
// servidor já tinha resolvido.
import type { Trail } from '@/lib/curriculum';
import { TrailCompletionModal } from '@/components/TrailCompletionModal';
// `quizzes` chega pronto como prop — ver nota abaixo.
import type { QuizExtraido } from '@/lib/article-extract';

/**
 * Botão "concluir módulo" da rota /aprenda/[slug].
 *
 * ─── Por que este componente existe ───
 *
 * O laço de gamificação estava DESCONECTADO do conteúdo. `markComplete` — que
 * concede XP, move o streak, avalia badge, sobe de nível e, criticamente, cria os
 * cards de revisão espaçada — era chamado apenas por `ModuleLayout`, o componente
 * legado da época em que cada módulo era um page.tsx escrito à mão. A rota atual,
 * CMS-driven, renderiza via BlockRenderer e não chamava nada.
 *
 * O efeito medido: ler qualquer um dos 393 módulos não dava XP, não movia streak,
 * não desbloqueava badge e não gerava um único card de SRS. O SM-2 — descrito no
 * CLAUDE.md como diferencial central da escola, "o mesmo do Anki" — nunca recebia
 * material, porque `addCardsFromQuiz` é a única fonte de cards e ninguém a
 * alcançava. A página /revisar ficava permanentemente vazia.
 *
 * ─── O que ele faz ───
 *
 * Extrai os blocos `quiz` da árvore do artigo (em qualquer profundidade) e os
 * converte para o formato que `completeModule` espera, incluindo `correctIndex` →
 * `correct`. Cada quiz vira um card SRS com id `<slug>_q<i>`, então revisitar o
 * módulo não duplica card.
 *
 * ─── Comemoração de trilha ───
 *
 * O `TrailCompletionModal` (confetti, XP total, badges, compartilhar no LinkedIn,
 * próxima trilha) também tinha o `ModuleLayout` como único gatilho. Com a rota
 * legada fora do ar, concluir a última aula de uma trilha inteira não produzia
 * nenhuma marcação de fim: o usuário terminava 18 módulos de SAP-C03 e a única
 * diferença visível era um contador. O componente seguia no repositório, com teste
 * de render passando — verde sem estar ligado a nada. Aqui ele volta a ter gatilho.
 *
 * ─── `quizzes` chega pronto, não `blocks` (11/ago/2026) ───
 *
 * Até aqui este componente recebia `blocks: Block[]` — a árvore INTEIRA do
 * artigo — e extraía os quizzes no CLIENTE. Como é `'use client'`, o RSC
 * precisa serializar qualquer prop recebida: o conteúdo do módulo (que já
 * está no HTML visível via `<BlockTree>`) viajava DE NOVO no payload RSC, e
 * de novo mais uma vez em `AnkiExport` (mesmo padrão). Nas páginas `lab-*`
 * (as maiores do site) isso multiplicava um payload que já é grande. A
 * extração agora roda uma vez no Server Component (`extrairQuizzes`, de
 * `@/lib/article-extract`) e só o RESULTADO (poucos KB) chega aqui.
 */

export function ConcluirModulo({
  slug,
  title,
  readTime,
  trail: trilha,
  quizzes,
}: {
  slug: string;
  title: string;
  readTime: number;
  /** Trilha já resolvida pelo Server Component — não redescoberta aqui. */
  trail: Trail | undefined;
  /** Já extraído pelo Server Component — não `blocks` inteiro. */
  quizzes: QuizExtraido[];
}) {
  const { state, markComplete } = useGameState();
  const [resultado, setResultado] = useState<{ xp: number; cards: number } | null>(null);
  // `completeModule` calcula XP/cards em memória mesmo quando a persistência
  // falha (quota do localStorage estourada) — sem este estado, o botão
  // reportava "concluído · +N XP" para um progresso que nunca foi salvo.
  const [falhaAoSalvar, setFalhaAoSalvar] = useState(false);
  const [fimDeTrilha, setFimDeTrilha] = useState<{
    trilha: Trail;
    xpTotal: number;
    badges: string[];
  } | null>(null);

  const jaFeito = !!state?.completedModules.includes(slug);

  const concluir = () => {
    const concluidosAntes = state?.completedModules ?? [];

    const r = markComplete({
      slug,
      title,
      trailColor: trilha?.color ?? 'var(--ffv-blue)',
      readTime,
      quiz: quizzes,
    });

    if (!r.persisted) {
      setFalhaAoSalvar(true);
      return;
    }
    setResultado({ xp: r.xpGained, cards: r.cardsAdded ?? quizzes.length });

    // Este módulo fechou a trilha? `state` é o valor do closure — ainda não contém
    // o slug atual —, então a checagem simula o conjunto pós-conclusão.
    if (trilha && trilha.modules.length > 0) {
      const depois = new Set(concluidosAntes);
      depois.add(slug);
      const fechouAgora =
        trilha.modules.every(m => depois.has(m.slug)) &&
        !trilha.modules.every(m => concluidosAntes.includes(m.slug));

      if (fechouAgora) {
        const xpTotal = trilha.modules.reduce((acc, m) => acc + m.xp, 0);
        // Atraso para o toast de XP/badge aparecer antes do modal tomar a tela.
        setTimeout(() => setFimDeTrilha({ trilha, xpTotal, badges: r.newBadges }), 900);
      }
    }
  };

  const cor = trilha?.color ?? 'var(--ffv-blue)';

  // Só aparece no fluxo de conclusão (o ramo `resultado`), nunca ao reabrir um
  // módulo já concluído — comemorar de novo o que já foi comemorado é ruído.
  const modalFimDeTrilha = fimDeTrilha ? (
    <TrailCompletionModal
      trail={fimDeTrilha.trilha}
      totalXp={fimDeTrilha.xpTotal}
      newBadges={fimDeTrilha.badges}
      onClose={() => setFimDeTrilha(null)}
    />
  ) : null;

  if (falhaAoSalvar) {
    return (
      <section
        className="mt-12 rounded-2xl p-6"
        style={{ background: 'var(--ffv-bg2)', border: '1px dashed rgba(210,153,34,0.45)' }}
        role="alert"
      >
        <p className="text-sm font-bold" style={{ color: 'var(--ffv-red, #dc2626)' }}>
          ⚠️ Não foi possível salvar seu progresso
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--ffv-muted)' }}>
          O armazenamento local do navegador está cheio. Libere espaço (ex.: limpe dados de
          outros sites) e tente marcar como concluído de novo.
        </p>
        <button
          type="button"
          onClick={() => { setFalhaAoSalvar(false); concluir(); }}
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold"
          style={{ background: cor, color: '#0d1117' }}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  if (resultado || jaFeito) {
    return (
      <>
      <section
        className="mt-12 rounded-2xl p-6"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid color-mix(in srgb, ${cor} 40%, transparent)`,
        }}
        aria-live="polite"
      >
        <p className="text-sm font-bold" style={{ color: cor }}>
          {resultado ? `✓ Módulo concluído · +${resultado.xp} XP` : '✓ Você já concluiu este módulo'}
        </p>

        {quizzes.length > 0 && (
          <p className="mt-2 text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {resultado && resultado.cards > 0
              ? `${resultado.cards} carta${resultado.cards > 1 ? 's' : ''} entraram na sua fila de revisão espaçada. `
              : 'As cartas deste módulo já estão na sua fila. '}
            O intervalo é recalculado a cada revisão pelo algoritmo SM-2 — revisar
            no dia certo é o que fixa a longo prazo.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/revisar"
            className="inline-flex min-h-[24px] items-center rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: cor, color: '#0d1117' }}
          >
            Revisar agora
          </Link>
          <Link
            href="/progresso"
            className="inline-flex min-h-[24px] items-center rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          >
            Ver meu progresso
          </Link>
        </div>
      </section>
      {modalFimDeTrilha}
      </>
    );
  }

  return (
    <section
      className="mt-12 rounded-2xl p-6"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <h2 className="text-base font-bold">Terminou de ler?</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        {quizzes.length > 0 ? (
          <>
            Marcar como concluído registra o XP, mantém sua sequência e coloca{' '}
            <strong>{quizzes.length} carta{quizzes.length > 1 ? 's' : ''}</strong> deste
            módulo na fila de revisão espaçada.
          </>
        ) : (
          <>Marcar como concluído registra o XP e mantém sua sequência de estudo.</>
        )}
      </p>
      <button
        type="button"
        onClick={concluir}
        className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
        style={{ background: cor, color: '#0d1117' }}
      >
        Marcar como concluído
      </button>
    </section>
  );
}
