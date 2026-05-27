/**
 * EXEMPLO de banco de questões pro hub IA.
 *
 * Pra ativar:
 *   1. Renomear este arquivo de `hub-ia.example.ts` pra `hub-ia.ts`.
 *   2. Em `index.ts`, registrar:
 *        import { BANK as IA_BANK } from './hub-ia';
 *        const BANK_REGISTRY = {
 *          ...
 *          'hub-ia': () => IA_BANK,
 *        };
 *   3. Recarregar.
 *
 * Estrutura recomendada (100 questões):
 *   - ~30 easy   — vocabulário, definições, conceitos básicos
 *   - ~50 medium — entendimento, "por que", comparações
 *   - ~20 hard   — análise, casos, debugging, decisões de projeto
 */

import type { QuestionBank } from './types';

export const BANK: QuestionBank = {
  hubId: 'hub-ia',
  hubName: 'Inteligência Artificial',
  questions: [
    // ─── EASY (definições / vocabulário) ────────────────────────────────────
    {
      id: 'ia-q-001',
      question: 'O que é um "embedding" no contexto de LLMs?',
      options: [
        'Uma representação vetorial densa de um token ou frase',
        'O nome do modelo treinado pela OpenAI',
        'O processo de comprimir um arquivo de áudio',
        'Uma técnica de criptografia simétrica',
      ],
      correct: 0,
      explanation:
        'Embedding é a representação vetorial densa (geralmente 768-4096 dimensões) que captura semântica de um token, frase ou documento. As outras opções confundem com nome de produto, compressão de áudio (codec) e cripto (não-relacionado).',
      difficulty: 'easy',
      tags: ['fundamentos', 'embeddings'],
    },
    // ... + 29 easy ...

    // ─── MEDIUM (entendimento / por que) ────────────────────────────────────
    {
      id: 'ia-q-031',
      question:
        'Por que multi-head attention performa melhor que single-head em transformers?',
      options: [
        'Mais cabeças permitem capturar diferentes tipos de relações em paralelo (sintática, semântica, posicional)',
        'É apenas uma otimização de hardware — não muda a expressividade',
        'Cabeças extras evitam overfitting via regularização explícita',
        'Single-head não funciona em batch maior que 1',
      ],
      correct: 0,
      explanation:
        'A intuição (Vaswani et al., 2017) é que cabeças diferentes aprendem a focar em padrões distintos — uma pode capturar dependências sintáticas (sujeito-verbo), outra coreferência, outra alinhamento posicional. Single-head precisa enfiar tudo numa só projeção, perdendo expressividade.',
      difficulty: 'medium',
      tags: ['transformers', 'attention'],
    },
    // ... + 49 medium ...

    // ─── HARD (análise / decisão) ───────────────────────────────────────────
    {
      id: 'ia-q-081',
      question:
        'Você tem RAG com 10K docs. Latência p95 = 2.8s. Onde investigar primeiro pra cortar tempo?',
      options: [
        'Profile da query no vector store + tamanho do context window do LLM',
        'Trocar o embedding model pra um maior — sempre melhora retrieval',
        'Aumentar top_k de 5 pra 50 — mais contexto, melhor resposta',
        'Migrar pro modelo Opus — Sonnet é o gargalo',
      ],
      correct: 0,
      explanation:
        'P95 de 2.8s em RAG quase sempre é (a) índice mal-otimizado (HNSW config errada, sem filtro pre-query) ou (b) context window inflado por chunks grandes desnecessários. Trocar embedding (B) raramente reduz latência. Aumentar top_k (C) PIORA latência E custo. Trocar pra Opus (D) piora latência (modelo maior).',
      difficulty: 'hard',
      tags: ['rag', 'produção'],
    },
    // ... + 19 hard ...
  ],
};
