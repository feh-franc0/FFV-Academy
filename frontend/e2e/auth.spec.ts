import { test, expect } from '@playwright/test';

/**
 * Auth mágico em modo mock: token "000000" sempre aceita.
 * Fluxo: AuthBadge "Entrar" no HUD → LoginModal (form 2 steps) → HUD mostra iniciais.
 */
test('login mágico via HUD com token mock 000000', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');

  // Limpa qualquer sessão prévia (testes rodam com storage persistente).
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?skipOnboarding=1');

  await page.getByRole('button', { name: 'Entrar' }).click();

  const dialog = page.getByRole('dialog', { name: 'Login' });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[type="text"]').first().fill('Teste E2E');
  await dialog.locator('input[type="email"]').fill('teste@ffv.dev');
  await dialog.locator('input[type="tel"]').fill('(11) 98765-4321');
  await dialog.locator('input[type="checkbox"]').check();

  await dialog.getByRole('button', { name: /Receber código/i }).click();

  // Passo 2: código.
  const codeInput = dialog.locator('input[inputmode="numeric"]');
  await expect(codeInput).toBeVisible();
  await codeInput.fill('000000');
  await dialog.getByRole('button', { name: /^Entrar$/ }).click();

  // Modal fecha e HUD passa a mostrar iniciais "TE".
  await expect(dialog).toBeHidden();
  await expect(page.getByTitle(/teste@ffv\.dev/)).toBeVisible();

  // Confirma persistência: user guardado em localStorage.
  const user = await page.evaluate(() => localStorage.getItem('ffv_user'));
  expect(user).toBeTruthy();
});
