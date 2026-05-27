/**
 * Registry central dos bancos de questões por hub.
 *
 * Como adicionar 100 questões a um hub:
 *   1. Criar `frontend/src/lib/question-bank/<hub-id>.ts` exportando
 *      `export const BANK: QuestionBank = { hubId, hubName, questions: [...] }`.
 *      Ver hub-ia.example.ts pra modelo (gera-se 100 itens fácil/médio/difícil).
 *   2. Registrar a importação dele em BANK_REGISTRY abaixo.
 *   3. Recarregar — a área /questoes pega automaticamente.
 *
 * NÃO é dynamic import por slug literal porque o Next/webpack não consegue
 * fazer tree-shake/análise estática nesse caso. Mapa explícito é mais
 * verbose mas garante bundle correto.
 */

import type { QuestionBank, BankQuestion, Difficulty } from './types';
export type { QuestionBank, BankQuestion, Difficulty } from './types';

// Adicione hubs aqui conforme você criar bancos próprios.
// Exemplo:
//   import { BANK as IA_BANK } from './hub-ia';
//   'hub-ia': () => IA_BANK,
const BANK_REGISTRY: Record<string, () => QuestionBank> = {
  // (vazio por enquanto — popule conforme criar arquivos por hub)
};

/** Lista todos os hubs que TÊM banco populado (>0 questões). */
export function listAvailableBanks(): QuestionBank[] {
  return Object.values(BANK_REGISTRY)
    .map(loader => loader())
    .filter(bank => bank.questions.length > 0);
}

/** Pega o banco de um hub específico. Retorna null se não houver. */
export function getBankForHub(hubId: string): QuestionBank | null {
  const loader = BANK_REGISTRY[hubId];
  return loader ? loader() : null;
}

/** Conta questões por dificuldade — útil pro card de hub na lista. */
export function countByDifficulty(bank: QuestionBank): Record<Difficulty, number> {
  return bank.questions.reduce(
    (acc, q) => {
      acc[q.difficulty]++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>,
  );
}

/** Embaralha questões com Fisher-Yates (mantém referências, não muta input). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
