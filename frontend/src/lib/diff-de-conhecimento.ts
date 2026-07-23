/**
 * diff-de-conhecimento — feature defensável #1 do MARKET_REFRESH_2026-05.md
 *
 * Idéia: aluno fez quiz X. A FFV roda esse mesmo quiz no ChatGPT/Gemini
 * via API e mostra "você está acima do ChatGPT em Y, abaixo em Z".
 *
 * V1: mock — usa scores hardcoded representativos pra demo do conceito.
 *      Aluno vê o card de comparação populado com plausible data.
 * V2: backend endpoint POST /api/v1/diff-de-conhecimento que recebe
 *      moduleSlug + answers do aluno, chama Claude+Gemini, retorna scores
 *      reais. Frontend troca DataSource pra HTTP-backed.
 *
 * Por que isso vence ChatGPT/NotebookLM: é a única plataforma que mostra
 * MATEMATICAMENTE que ela calibra melhor do que LLM cru. Honestidade
 * competitiva é arma defensável (EXECUTIVE_PLAN_2026-05.md).
 */

export interface QuizDiffEntry {
  moduleSlug: string;
  moduleTitle: string;
  baseSlug: string;
  /** Acerto do aluno (0-100). Vem do GameState.quizScores. */
  studentScore: number;
  /** Acerto do ChatGPT (4o ou 5) no mesmo quiz. */
  chatgptScore: number;
  /** Acerto do Gemini (2.5 Pro) no mesmo quiz. */
  geminiScore: number;
  /**
   * Topicos onde o aluno se sai MELHOR que ambos LLMs (intersecção).
   * Sinal pedagógico real — não é só nostalgia.
   */
  studentEdge: string[];
  /** Onde os LLMs ambos vão melhor que o aluno. */
  studentGap: string[];
}

/**
 * V1 mock — payloads representativos. Replicar com Claude API + Gemini API
 * em V2 (backend endpoint).
 *
 * Os números refletem realidade conhecida em educação adaptativa:
 * - LLM cru se sai bem em fundamentos memorizados
 * - Aluno calibrado se sai melhor em aplicação contextual e edge cases
 */
export const MOCK_DIFF_ENTRIES: QuizDiffEntry[] = [
  {
    moduleSlug: 'leis-de-mendel',
    moduleTitle: 'Leis de Mendel',
    baseSlug: 'medicina-veterinaria',
    studentScore: 90,
    chatgptScore: 88,
    geminiScore: 85,
    studentEdge: ['Cruzamento di-híbrido aplicado a casos veterinários reais'],
    studentGap: ['Definições históricas (data exata dos experimentos)'],
  },
  {
    moduleSlug: 'genes-letais',
    moduleTitle: 'Genes Letais',
    baseSlug: 'medicina-veterinaria',
    studentScore: 80,
    chatgptScore: 72,
    geminiScore: 75,
    studentEdge: [
      'Identificação de genes letais em pelagem (gato amarelo, callico)',
      'Raciocínio sobre proporções 2:1 vs 3:1',
    ],
    studentGap: [],
  },
  {
    moduleSlug: 'hardy-weinberg',
    moduleTitle: 'Hardy-Weinberg',
    baseSlug: 'medicina-veterinaria',
    studentScore: 70,
    chatgptScore: 92,
    geminiScore: 90,
    studentEdge: [],
    studentGap: [
      'Cálculo direto de frequências alélicas',
      'Equação p² + 2pq + q² = 1',
    ],
  },
];

export interface DiffSummary {
  totalQuizzes: number;
  studentAvg: number;
  chatgptAvg: number;
  geminiAvg: number;
  /** "ahead", "behind", "tied" — narrativa principal. */
  vsChatGPT: 'ahead' | 'behind' | 'tied';
  vsGemini: 'ahead' | 'behind' | 'tied';
  /** Diferença em pontos percentuais (positivo = aluno na frente). */
  pointsAheadOfChatGPT: number;
  pointsAheadOfGemini: number;
}

export function computeDiffSummary(entries: ReadonlyArray<QuizDiffEntry>): DiffSummary {
  if (entries.length === 0) {
    return {
      totalQuizzes: 0,
      studentAvg: 0,
      chatgptAvg: 0,
      geminiAvg: 0,
      vsChatGPT: 'tied',
      vsGemini: 'tied',
      pointsAheadOfChatGPT: 0,
      pointsAheadOfGemini: 0,
    };
  }

  const avg = (key: keyof QuizDiffEntry) =>
    entries.reduce((sum, e) => sum + (e[key] as number), 0) / entries.length;

  const studentAvg = Math.round(avg('studentScore'));
  const chatgptAvg = Math.round(avg('chatgptScore'));
  const geminiAvg = Math.round(avg('geminiScore'));

  const pointsAheadOfChatGPT = studentAvg - chatgptAvg;
  const pointsAheadOfGemini = studentAvg - geminiAvg;

  return {
    totalQuizzes: entries.length,
    studentAvg,
    chatgptAvg,
    geminiAvg,
    vsChatGPT: pointsAheadOfChatGPT > 2 ? 'ahead' : pointsAheadOfChatGPT < -2 ? 'behind' : 'tied',
    vsGemini: pointsAheadOfGemini > 2 ? 'ahead' : pointsAheadOfGemini < -2 ? 'behind' : 'tied',
    pointsAheadOfChatGPT,
    pointsAheadOfGemini,
  };
}
