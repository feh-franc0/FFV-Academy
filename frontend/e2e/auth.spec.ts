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

  // Step 1: email → Continuar
  await dialog.locator('input[type="email"]').fill('teste@ffv.dev');
  await dialog.getByRole('button', { name: /Continuar/i }).click();

  // Step 2 (register, novo usuário): nome + (celular se feature ligada) + consent + código → Entrar
  await dialog.locator('input[type="text"]').first().fill('Teste E2E');
  // Phone só renderiza se NEXT_PUBLIC_FEATURE_PHONE_AUTH_ENABLED=true.
  // Em ambiente padrão (e CI) a flag está OFF, então não tem input tel.
  const phoneInput = dialog.locator('input[type="tel"]');
  if ((await phoneInput.count()) > 0) {
    await phoneInput.fill('(11) 98765-4321');
  }
  await dialog.locator('input[type="checkbox"]').check();

  const codeInput = dialog.locator('input[inputmode="numeric"]');
  await expect(codeInput).toBeVisible();
  await codeInput.fill('000000');
  await dialog.getByRole('button', { name: /Entrar na conta/i }).click();

  // Modal fecha e HUD passa a mostrar iniciais "TE".
  await expect(dialog).toBeHidden();
  await expect(page.getByTitle(/teste@ffv\.dev/)).toBeVisible();

  // Confirma persistência: user guardado em localStorage.
  const user = await page.evaluate(() => localStorage.getItem('ffv_user'));
  expect(user).toBeTruthy();
});
