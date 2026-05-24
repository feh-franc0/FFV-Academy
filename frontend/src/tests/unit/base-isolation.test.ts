import { describe, it, expect, beforeEach, vi } from 'vitest';

// Regressão crítica reportada em 2026-05-21:
//   1. ContinueCard sugeria módulo TECH em /medicina-veterinaria.
//   2. DailyModule retornava módulo AWS em medvet.
//   3. Quests da Semana mostravam contagem global (4/5) em medvet quando
//      o usuário só tinha completado módulos em tech.
//
// Estes testes travam todos os 3 pontos. Falham se a regressão voltar.

describe('Isolamento por base — universo de módulos', () => {
  it('getAllModulesForBase("tecnologia") → módulos de tech', async () => {
    const { getAllModulesForBase } = await import('@/lib/bases/all-modules');
    const mods = getAllModulesForBase('tecnologia');
    expect(mods.length).toBeGreaterThan(50);
    // Tech tem hrefs /aprenda/*, nunca /medicina-veterinaria/*
    expect(mods.every(m => m.href.startsWith('/aprenda/'))).toBe(true);
  });

  it('getAllModulesForBase("medicina-veterinaria") → 16 módulos (Genética 12 + Métodos de Seleção 4)', async () => {
    const { getAllModulesForBase } = await import('@/lib/bases/all-modules');
    const mods = getAllModulesForBase('medicina-veterinaria');
    expect(mods.length).toBe(16);
    expect(mods.every(m => m.href.startsWith('/medicina-veterinaria/'))).toBe(true);
    // Trilha pode ser "Genética Veterinária" ou "Métodos de Seleção e Testes"
    const trailNames = new Set(mods.map(m => m.trailName.toLowerCase()));
    expect(trailNames.size).toBeGreaterThanOrEqual(2);
  });

  it('getAllModulesForBase com slug desconhecido → []', async () => {
    const { getAllModulesForBase } = await import('@/lib/bases/all-modules');
    expect(getAllModulesForBase('direito')).toEqual([]);
    expect(getAllModulesForBase('inexistente')).toEqual([]);
  });

  it('NUNCA vaza tech em medvet — sets disjuntos', async () => {
    const { getAllModulesForBase } = await import('@/lib/bases/all-modules');
    const techSlugs = new Set(getAllModulesForBase('tecnologia').map(m => m.slug));
    const medvetSlugs = new Set(getAllModulesForBase('medicina-veterinaria').map(m => m.slug));
    for (const s of medvetSlugs) {
      expect(techSlugs.has(s)).toBe(false);
    }
  });
});

describe('Isolamento por base — DailyModule', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
  });

  it('em medvet sorteia módulo MEDVET (não AWS/IA)', async () => {
    const { getDailyModule } = await import('@/lib/dailyModule');
    const d = getDailyModule({ baseSlug: 'medicina-veterinaria' });
    expect(d).not.toBeNull();
    expect(d!.title.toLowerCase()).not.toMatch(/aws|cloud practitioner|transformers|kubernetes|postgres/);
    // Trail de medvet — Genética OU Métodos de Seleção (medvet tem 2 trilhas)
    expect(d!.trailName.toLowerCase()).toMatch(/genética|métodos de seleção/);
  });

  it('em tech sorteia módulo TECH', async () => {
    const { getDailyModule } = await import('@/lib/dailyModule');
    const d = getDailyModule({ baseSlug: 'tecnologia' });
    expect(d).not.toBeNull();
    // Nunca um módulo medvet
    expect(d!.title.toLowerCase()).not.toMatch(/mendel|genética|hardy-weinberg|alelism/);
  });

  it('em base sem módulos cadastrados → null (some o card)', async () => {
    const { getDailyModule } = await import('@/lib/dailyModule');
    expect(getDailyModule({ baseSlug: 'direito' })).toBeNull();
  });

  it('hash é determinístico — mesmo dia/base sempre devolve mesmo módulo', async () => {
    const { getDailyModule } = await import('@/lib/dailyModule');
    const a = getDailyModule({ baseSlug: 'medicina-veterinaria' });
    const b = getDailyModule({ baseSlug: 'medicina-veterinaria' });
    expect(a?.slug).toBe(b?.slug);
  });
});

describe('Isolamento por base — counters de quests', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.useRealTimers();
  });

  it('bumpBaseModulesCompleted é por base — não vaza entre tech e medvet', async () => {
    const {
      bumpBaseModulesCompleted,
      getBaseModulesCompletedToday,
      getBaseModulesCompletedThisWeek,
    } = await import('@/lib/bases/state-selectors');

    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('medicina-veterinaria');

    expect(getBaseModulesCompletedToday('tecnologia')).toBe(3);
    expect(getBaseModulesCompletedToday('medicina-veterinaria')).toBe(1);
    expect(getBaseModulesCompletedThisWeek('tecnologia')).toBe(3);
    expect(getBaseModulesCompletedThisWeek('medicina-veterinaria')).toBe(1);
    // Bases nunca tocadas: 0
    expect(getBaseModulesCompletedToday('direito')).toBe(0);
  });

  it('bumpBaseReviewCount é por base + marca atividade do dia', async () => {
    const {
      bumpBaseReviewCount,
      getBaseReviewCountToday,
      getBaseReviewCountThisWeek,
      hasBaseActivityToday,
    } = await import('@/lib/bases/state-selectors');

    bumpBaseReviewCount('medicina-veterinaria');
    bumpBaseReviewCount('medicina-veterinaria');
    expect(getBaseReviewCountToday('medicina-veterinaria')).toBe(2);
    expect(getBaseReviewCountThisWeek('medicina-veterinaria')).toBe(2);
    expect(getBaseReviewCountToday('tecnologia')).toBe(0);
    expect(hasBaseActivityToday('medicina-veterinaria')).toBe(true);
    expect(hasBaseActivityToday('tecnologia')).toBe(false);
  });

  it('bumpBaseXPEarned acumula por base+semana', async () => {
    const { bumpBaseXPEarned, getBaseXPEarnedThisWeek } = await import('@/lib/bases/state-selectors');
    bumpBaseXPEarned('tecnologia', 75);
    bumpBaseXPEarned('tecnologia', 50);
    bumpBaseXPEarned('medicina-veterinaria', 30);
    expect(getBaseXPEarnedThisWeek('tecnologia')).toBe(125);
    expect(getBaseXPEarnedThisWeek('medicina-veterinaria')).toBe(30);
    // XP <=0 é ignorado (defensivo)
    bumpBaseXPEarned('tecnologia', 0);
    bumpBaseXPEarned('tecnologia', -10);
    expect(getBaseXPEarnedThisWeek('tecnologia')).toBe(125);
  });

  it('bumpBaseXPEarned ALSO populates the lifetime total bucket (HUD chip)', async () => {
    const { bumpBaseXPEarned, getBaseXPTotal } = await import('@/lib/bases/state-selectors');
    bumpBaseXPEarned('medicina-veterinaria', 75);
    bumpBaseXPEarned('medicina-veterinaria', 50);
    bumpBaseXPEarned('tecnologia', 30);
    expect(getBaseXPTotal('medicina-veterinaria')).toBe(125);
    expect(getBaseXPTotal('tecnologia')).toBe(30);
    // Bases nunca tocadas: 0 (sem fallback aqui — fallback é decisão do HUD)
    expect(getBaseXPTotal('direito')).toBe(0);
  });

  it('getBaseXPTotal NÃO zera ao virar a semana (cumulativo, diferente do semanal)', async () => {
    // Validação de schema/contrato — o teste de "virar semana" propriamente
    // dito requer travar Date.now(); aqui validamos que a CHAVE não inclui
    // o weekStart ISO, então não vai zerar.
    const { bumpBaseXPEarned, getBaseXPTotal } = await import('@/lib/bases/state-selectors');
    bumpBaseXPEarned('tecnologia', 100);
    // Lê direto a chave pra garantir que não tem weekStart no nome.
    const key = Object.keys(window.localStorage).find(k => k.startsWith('ffv_xp_total:tecnologia'));
    expect(key).toBe('ffv_xp_total:tecnologia');
    expect(getBaseXPTotal('tecnologia')).toBe(100);
  });
});

describe('Isolamento por base — Quest progress por base ativa', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
  });

  // Stub minimal de GameState (só os campos que getQuestProgress lê).
  const makeState = () => ({
    xp: 100,
    studyDays: [],
    quests: { daily: [], weekly: [] },
    questsClaimedAt: {},
    lastStudyDate: '',
  });

  it('weekly-modules em medvet conta APENAS módulos medvet', async () => {
    const { getQuestProgress } = await import('@/lib/quests');
    const { bumpBaseModulesCompleted } = await import('@/lib/bases/state-selectors');

    // Usuário fez 4 módulos em TECH e 1 em medvet esta semana.
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('tecnologia');
    bumpBaseModulesCompleted('medicina-veterinaria');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const med = getQuestProgress(makeState() as any, 'medicina-veterinaria');
    const wmMed = med.find(p => p.quest.id === 'weekly-modules')!;
    expect(wmMed.current).toBe(1); // só medvet

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tec = getQuestProgress(makeState() as any, 'tecnologia');
    const wmTec = tec.find(p => p.quest.id === 'weekly-modules')!;
    expect(wmTec.current).toBe(4); // só tech
  });

  it('daily-streak considera atividade NA BASE (não streak global)', async () => {
    const { getQuestProgress } = await import('@/lib/quests');
    const { bumpBaseActivityToday } = await import('@/lib/bases/state-selectors');

    bumpBaseActivityToday('medicina-veterinaria');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const med = getQuestProgress(makeState() as any, 'medicina-veterinaria');
    expect(med.find(p => p.quest.id === 'daily-streak')!.current).toBe(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tec = getQuestProgress(makeState() as any, 'tecnologia');
    expect(tec.find(p => p.quest.id === 'daily-streak')!.current).toBe(0);
  });
});
