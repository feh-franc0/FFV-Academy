/**
 * Extração de quiz/Q&A a partir da árvore de blocos de um artigo.
 *
 * Movido de `ConcluirModulo.tsx` e `AnkiExport.tsx` (ambos `'use client'`) em
 * 11/ago/2026. Os dois recebiam `blocks: Block[]` — a árvore INTEIRA do
 * artigo — como prop, só para rodar esta extração no navegador. Como são
 * client components, o RSC precisa serializar qualquer prop que recebem: o
 * conteúdo do módulo (que já está no HTML visível via `<BlockTree>`) viajava
 * de novo no payload RSC, uma vez por componente que recebia `blocks`.
 *
 * Medido: as páginas `lab-*` (as maiores do site, com blocos de código
 * grandes em Terraform/YAML/.NET) chegam a 1,42 MB de HTML, 61% payload RSC.
 * `blocks` sendo repassado a 2 client components é uma fatia direta e
 * evitável dessa duplicação — sem precisar mexer no BlockTree/streaming.
 *
 * Este arquivo NÃO tem `'use client'`: roda no Server Component
 * (`/aprenda/[slug]/page.tsx`), que chama as duas funções uma vez e passa só
 * o resultado extraído (poucos KB) para `ConcluirModulo`/`AnkiExport`.
 */

import type { Block } from '@/components/article/blocks/schemas';

export interface QuizExtraido {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

/** Percorre a árvore e coleta os quizzes na ordem em que aparecem no artigo. */
export function extrairQuizzes(blocos: Block[]): QuizExtraido[] {
  const saida: QuizExtraido[] = [];

  const andar = (bs: Block[]) => {
    for (const b of bs) {
      if (b.type === 'quiz') {
        const d = b.data as Record<string, unknown>;
        const opcoes = Array.isArray(d.options) ? d.options.map(String) : [];
        // O bloco usa `correctIndex`; o engine espera `correct`. Essa tradução é
        // o motivo pelo qual não dá para passar `b.data` direto.
        const correct = typeof d.correctIndex === 'number' ? d.correctIndex : 0;
        if (typeof d.question === 'string' && opcoes.length >= 2) {
          saida.push({
            question: d.question,
            options: opcoes,
            correct,
            explanation: typeof d.explanation === 'string' ? d.explanation : '',
          });
        }
      }
      const filhos = (b as { children?: Block[] }).children;
      if (Array.isArray(filhos)) andar(filhos);
    }
  };

  andar(blocos);
  return saida;
}

function asText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(asText).join(' ');
  if (v && typeof v === 'object' && 'text' in (v as Record<string, unknown>)) {
    return asText((v as { text: unknown }).text);
  }
  return '';
}

/** Percorre a árvore e coleta pares pergunta/resposta dos blocos `qa_item`. */
export function extractQA(blocks: Block[]): Array<{ q: string; a: string }> {
  const out: Array<{ q: string; a: string }> = [];
  function walk(arr: Block[]) {
    for (const b of arr) {
      if (b.type === 'qa_item') {
        const data = (b.data ?? {}) as Record<string, unknown>;
        const q = asText(data.question).trim();
        const a = asText(data.answer).trim();
        if (q && a) out.push({ q, a });
      }
      if (b.children?.length) walk(b.children);
    }
  }
  walk(blocks);
  return out;
}
