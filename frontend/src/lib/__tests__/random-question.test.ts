import { describe, it, expect } from 'vitest';
import { buildPool, pickDailyQuestion, hashString, type PoolQuestion } from '../random-question';
import type { GameState } from '../engine';

/**
 * Fixture da fonte 'simulado', usada no lugar do catálogo de produção.
 *
 * Até ago/2026 este teste chamava `buildPool()` sem argumentos e confiava em
 * `SIMULADOS_CATALOG` ter pelo menos um simulado com `questions` inline — o
 * que era um acidente de conteúdo (a SAA-C03 ainda era 5 questões de prévia),
 * não uma garantia de contrato. Quando a SAA ganhou banco real no Postgres e
 * o catálogo passou a `questions: []` em todo simulado, o pool ficou vazio e
 * o teste passou a testar a ausência de bug errado.
 *
 * `buildPool` agora recebe a amostra de simulado como PARÂMETRO explícito —
 * ver `fetchSimuladoSample` em `random-question.ts` para quem a produz em
 * produção (busca na API). Aqui, a fixture testa o CONTRATO de `buildPool`
 * sem depender de dado incidental de um arquivo de conteúdo.
 */
const SIMULADO_SAMPLE: PoolQuestion[] = [
  {
    id: 'sim_fixture_q1', source: 'simulado', stem: 'Fixture 1?',
    options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }],
    correctId: 'A', explanation: 'porque sim', topic: 'Fixture', difficulty: 'easy',
  },
  {
    id: 'sim_fixture_q2', source: 'simulado', stem: 'Fixture 2?',
    options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }],
    correctId: 'B', explanation: 'porque sim', topic: 'Fixture', difficulty: 'easy',
  },
];

function emptyState(overrides: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 5,
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    completedModules: [],
    quizScores: {},
    badges: [],
    totalStudyTime: 0,
    startedAt: null,
    reviewCards: [],
    archivedCards: [],
    studyDays: [],
    freezes: 0,
    dailyGoal: 3,
    lastReviewDate: null,
    lastArticle: null,
    preferredHub: null,
    onboardedAt: null,
    articleProgress: {},
    perfectQuizStreak: 0,
    earlyMorningDays: [],
    trailStartedAt: {},
    bookmarks: [],
    moduleRatings: {},
    quests: { daily: [], weekly: [] },
    dailyQuestion: undefined,
    dailyQuestionStreak: 0,
    dailyQuestionHistory: [],
    ...overrides,
  };
}

describe('hashString', () => {
  it('é determinístico', () => {
    expect(hashString('foo|2026-05-14')).toBe(hashString('foo|2026-05-14'));
  });
  it('diferentes seeds → hashes diferentes (alta probabilidade)', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('buildPool', () => {
  it('sem reviewCards nem amostra de simulado, o pool fica vazio — não é bug, é o chamador que precisa buscar a amostra', () => {
    // Este é o comportamento que causava o card "Pergunta do Dia" sumir para
    // usuário novo até ago/2026, quando ninguém buscava a amostra. Hoje é
    // esperado e documentado: `DailyQuestionCard` chama `fetchSimuladoSample`.
    const pool = buildPool();
    expect(pool).toEqual([]);
  });

  it('inclui source=simulado quando uma amostra pré-buscada é fornecida', () => {
    const pool = buildPool(undefined, SIMULADO_SAMPLE);
    expect(pool.some(q => q.source === 'simulado')).toBe(true);
    expect(pool).toHaveLength(SIMULADO_SAMPLE.length);
  });

  it('inclui source=module quando reviewCards são providos', () => {
    const reviewCards: GameState['reviewCards'] = [{
      id: 'o-que-e-ia_q0',
      slug: 'o-que-e-ia',
      title: 'O que é IA',
      trailColor: '#58a6ff',
      question: 'Q?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'porque sim',
      easeFactor: 2.5,
      interval: 0,
      repetition: 0,
      dueDate: '2026-05-14',
      lastReview: null,
    }];
    const pool = buildPool(reviewCards);
    expect(pool.some(q => q.source === 'module')).toBe(true);
  });
});

describe('pickDailyQuestion', () => {
  const today = '2026-05-14';
  const pool = buildPool(undefined, SIMULADO_SAMPLE);

  it('é determinístico para mesma seed', () => {
    const state = emptyState();
    const a = pickDailyQuestion(state, pool, today, 'user-42');
    const b = pickDailyQuestion(state, pool, today, 'user-42');
    expect(a?.id).toBe(b?.id);
  });

  it('seeds diferentes podem retornar perguntas diferentes', () => {
    const state = emptyState();
    const a = pickDailyQuestion(state, pool, today, 'user-aaa');
    const b = pickDailyQuestion(state, pool, today, 'user-zzz');
    // Não afirma que a e b são DIFERENTES — com pool pequeno (fixture de 2
    // itens) duas seeds podem legitimamente colidir. O que importa aqui é que
    // nenhuma delas retorna null com pool não vazio.
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it('retorna null para pool vazio', () => {
    expect(pickDailyQuestion(emptyState(), [], today, 'x')).toBeNull();
  });

  it('prefere SRS due cards quando bucket SRS está populado e roll cai em <30', () => {
    // Construímos um state onde 1 reviewCard está due hoje
    const reviewCards: GameState['reviewCards'] = [{
      id: 'o-que-e-ia_q0',
      slug: 'o-que-e-ia',
      title: 'O que é IA',
      trailColor: '#58a6ff',
      question: 'Q SRS?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'porque sim',
      easeFactor: 2.5,
      interval: 0,
      repetition: 0,
      dueDate: today, // due
      lastReview: null,
    }];
    const state = emptyState({ reviewCards });
    const poolWithMod = buildPool(reviewCards);
    // Buscamos uma seed onde o hash cai em <30 (bucket SRS first)
    let foundSrsBucket = false;
    for (let i = 0; i < 100; i++) {
      const seed = `seed-${i}`;
      const h = hashString(`${seed}|${today}`) % 100;
      if (h < 30) {
        const q = pickDailyQuestion(state, poolWithMod, today, seed);
        if (q && q.source === 'module') {
          foundSrsBucket = true;
          break;
        }
      }
    }
    expect(foundSrsBucket).toBe(true);
  });

  it('evita repetir pergunta que está no histórico', () => {
    const state = emptyState();
    const first = pickDailyQuestion(state, pool, today, 'seed-x');
    expect(first).not.toBeNull();
    const stateWithHistory = emptyState({
      dailyQuestionHistory: [{ id: first!.id, date: today, correct: true, source: first!.source }],
    });
    const second = pickDailyQuestion(stateWithHistory, pool, today, 'seed-x');
    expect(second?.id).not.toBe(first!.id);
  });
});
