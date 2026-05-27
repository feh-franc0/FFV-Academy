/**
 * Banco de questões adicional por hub — 100 questões por hub além das que
 * já existem dentro dos quizzes de cada módulo.
 *
 * Diferença vs quizzes de módulo:
 *   - Quiz de módulo: 7-10 questões direto sobre o conteúdo daquele artigo
 *   - Banco de questões: 100 questões transversais cobrindo o hub inteiro,
 *     com distribuição de dificuldade declarada (easy/medium/hard)
 *
 * Cada hub pode (mas não precisa) ter seu arquivo de banco. Hubs sem banco
 * mostram "em construção" na UI mas o resto da plataforma funciona normal.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BankQuestion {
  /** ID único dentro do banco do hub (ex: 'ia-q-001'). */
  id: string;
  /** Enunciado. */
  question: string;
  /** Alternativas (4-5 itens). */
  options: string[];
  /** Índice da alternativa correta (0-based). */
  correct: number;
  /** Explicação obrigatória — por que a certa é certa, por que as outras não. */
  explanation: string;
  /** Nível de dificuldade. Usado pra filtro e pra distribuição visível. */
  difficulty: Difficulty;
  /** Tags opcionais (ex: ['transformers', 'attention']) pra futuros filtros. */
  tags?: string[];
}

export interface QuestionBank {
  /** Slug/ID do hub dono do banco (deve casar com Hub.id em curriculum.ts). */
  hubId: string;
  /** Nome humano pra exibição (ex: "Inteligência Artificial"). */
  hubName: string;
  /** Questões do banco. Ideal: 100 (com distribuição ~30 easy / 50 medium / 20 hard). */
  questions: BankQuestion[];
}
