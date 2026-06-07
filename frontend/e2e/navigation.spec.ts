import { test, expect } from '@playwright/test';

/**
 * Fluxo editorial livre: home → hub IA → trilha → artigo.
 * Nenhum gate de auth — deve funcionar sem login.
 */
test('home → hub IA → trilha → artigo', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await expect(page).toHaveTitle(/FFV Academy/i);

  // Hub IA — navegação direta. Após padronização jun/2026, /ia renderiza
  // ProfissionalBaseHome (mesmo template das outras single-hub bases),
  // que mostra o nome completo "Inteligência Artificial" no hero — não
  // mais o breadcrumb "Hub · IA" do antigo HubPageClient.
  await page.goto('/ia?skipOnboarding=1');
  await expect(page.getByRole('heading', { name: /Inteligência Artificial/i }).first()).toBeVisible();

  // Trilha de fundamentos
  await page.goto('/fundamentos-da-ia?skipOnboarding=1');
  await expect(page.getByText(/Fundamentos da IA/i).first()).toBeVisible();

  // Artigo
  await page.goto('/aprenda/o-que-e-ia?skipOnboarding=1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Inteligência Artificial/i);
});
