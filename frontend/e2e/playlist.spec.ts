import { test, expect } from '@playwright/test';

/**
 * Playlists são curadas (estáticas), não user-created — não há "criar playlist".
 * Este spec valida que (1) a página /playlists renderiza corretamente e
 * (2) o progresso do usuário persiste: ao marcar 2 módulos como completos
 * em localStorage, a playlist "Do zero à IA" mostra pelo menos 2/N completos
 * após reload.
 */
test('progresso em módulos da playlist persiste após reload', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await page.evaluate(() => {
    localStorage.clear();
    // Simula 2 módulos da playlist "do-zero-a-ia" já completos.
    const gameState = {
      xp: 60,
      level: 1,
      streak: 0,
      freezes: 0,
      lastStudyAt: null,
      completedModules: ['o-que-e-ia', 'dados-o-combustivel'],
      quizScores: {},
      badges: [],
      reviewCards: [],
      studyDays: [],
      onboardedAt: new Date().toISOString(),
    };
    localStorage.setItem('ffv_academy', JSON.stringify(gameState));
  });

  await page.goto('/playlists?skipOnboarding=1');
  await expect(page.getByRole('heading', { name: /Playlists curadas/i })).toBeVisible();

  // A playlist "Do zero à IA" tem 8 módulos; esperamos "2/8".
  await expect(page.getByText(/Do zero à IA/i).first()).toBeVisible();
  await expect(page.getByText(/2\/8/).first()).toBeVisible();

  // Reload — progresso deve persistir (é localStorage).
  await page.reload();
  await expect(page.getByText(/2\/8/).first()).toBeVisible();
});
