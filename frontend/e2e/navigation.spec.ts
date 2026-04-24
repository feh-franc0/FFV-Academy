import { test, expect } from '@playwright/test';

/**
 * Fluxo editorial livre: home → hub IA → trilha → artigo.
 * Nenhum gate de auth — deve funcionar sem login.
 */
test('home → hub IA → trilha → artigo', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await expect(page).toHaveTitle(/FFV Academy/i);

  // Hub IA — navegação direta (link existe múltiplas vezes; primeiro match basta).
  await page.goto('/ia?skipOnboarding=1');
  await expect(page.getByText(/Hub · IA/i).first()).toBeVisible();

  // Trilha de fundamentos
  await page.goto('/fundamentos-da-ia?skipOnboarding=1');
  await expect(page.getByText(/Fundamentos da IA/i).first()).toBeVisible();

  // Artigo
  await page.goto('/aprenda/o-que-e-ia?skipOnboarding=1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Inteligência Artificial/i);
});
