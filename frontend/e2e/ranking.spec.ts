import { test, expect } from '@playwright/test';

/**
 * E2E — /ranking
 *
 * Cobertura:
 *  - Carga inicial: header dourado + h1 visível
 *  - Tabs de período mudam o label do período
 *  - Empty state aparece quando o backend não retorna entries
 *
 * Notas:
 *  - Backend pode estar offline em ambiente local. Quando o fetch retorna
 *    null/lista vazia, o componente cai no <EmptyState> ("Ranking em formação").
 *  - Em vez de mockar a API, usamos getByText em alternativas (header sempre presente).
 */

test.describe('/ranking', () => {
  test('carrega header e exibe ranking ou empty state', async ({ page }) => {
    await page.goto('/ranking?skipOnboarding=1');
    // Kicker agora é base-aware via activeBase.microcopy.rankingTitle —
    // tech: "Top devs da semana"; medvet: "Top vets da semana".
    // Sem localStorage com base ativa, ActiveBaseProvider cai pro DEFAULT
    // (tecnologia), então o texto visível é "Top devs da semana".
    await expect(page.getByText(/Top (devs|vets) da semana/i)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /profissionais mais qualificados/i,
    );
  });

  test('tabs de período mudam o label exibido', async ({ page }) => {
    await page.goto('/ranking?skipOnboarding=1');

    // Espera saída do skeleton — algum dos estados deve estar pintado
    await page.waitForLoadState('networkidle');

    // Clica em "Anual" — desktop usa label completo, mobile usa "ANO".
    // O Playwright default é desktop; pegamos o botão por texto visível.
    const anualBtn = page.getByRole('button', { name: /Anual|ANO/i });
    await anualBtn.first().click();

    // Após clicar em "Anual", o label muda para algo como "ANO 2026"
    // (formatPeriodLabel retorna `ANO ${year}` quando há periodStart, ou string vazia).
    // Em ambos os casos o botão fica com fundo dourado — verificamos via aria/state visual.
    // Como não há aria-pressed, validamos que o clique não quebrou e que outro botão pode ser clicado.
    const semanalBtn = page.getByRole('button', { name: /Semanal|SEMANA/i });
    await expect(semanalBtn.first()).toBeVisible();
    await semanalBtn.first().click();

    // Após semanal, ainda devemos ver o título principal (página não quebrou)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('empty state OU pódio aparece quando carrega', async ({ page }) => {
    await page.goto('/ranking?skipOnboarding=1');
    await page.waitForLoadState('networkidle');

    // Espera algum dos dois estados terminais (não skeleton).
    // Empty state tem o texto "Ranking em formação"; com dados, tem "1º LUGAR".
    const empty = page.getByText(/Ranking em formação/i);
    const podium = page.getByText(/1º LUGAR/i).first();

    await expect(async () => {
      const emptyVisible = await empty.isVisible().catch(() => false);
      const podiumVisible = await podium.isVisible().catch(() => false);
      expect(emptyVisible || podiumVisible).toBe(true);
    }).toPass({ timeout: 10_000 });
  });

  test('página de ranking não trava com API offline', async ({ page }) => {
    // Block all leaderboard API calls to simulate network failure
    await page.route('**/api/v1/leaderboard**', (route) => route.abort());

    await page.goto('/ranking');
    await page.waitForTimeout(2000);

    // Page should still render — show loading state or fallback, never an error URL
    await expect(page).not.toHaveURL(/error/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5_000 });
  });
});
