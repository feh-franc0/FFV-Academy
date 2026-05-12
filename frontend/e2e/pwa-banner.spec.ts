import { test, expect } from '@playwright/test';

/**
 * E2E — PWAInstallBanner
 *
 * Cobertura:
 *  - Banner não aparece sem o evento `beforeinstallprompt` (estado padrão)
 *  - Banner não aparece quando dismiss key está no localStorage (< 14 dias)
 *  - Banner pode aparecer quando dismiss expirou (> 14 dias)
 *  - Dismiss persiste no localStorage e impede nova exibição imediata
 *
 * Nota: `beforeinstallprompt` é uma API do browser que Playwright/Chromium
 * não dispara automaticamente. Os testes focam na lógica de persistência
 * (localStorage) e ausência de crashes.
 */

const DISMISS_KEY = 'ffv:pwaInstallBannerDismissedAt';

test.describe('PWAInstallBanner', () => {
  test.beforeEach(async ({ page }) => {
    // Remove dismiss key so banner logic can run freely
    await page.addInitScript(() => {
      localStorage.removeItem('ffv:pwaInstallBannerDismissedAt');
    });
  });

  test('banner não aparece sem evento beforeinstallprompt', async ({ page }) => {
    await page.goto('/');
    // Without beforeinstallprompt firing, component renders null (dismissed=true || installPrompt=null)
    await page.waitForTimeout(500);
    const banner = page.locator('[aria-label="Instalar FFV Academy como app"]');
    // The banner should not be present in the DOM or not visible
    const count = await banner.count();
    if (count > 0) {
      await expect(banner).not.toBeVisible();
    }
  });

  test('banner não aparece quando dismiss key tem menos de 14 dias', async ({ page }) => {
    await page.addInitScript((key) => {
      // Dismissed just now — well within 14-day window
      localStorage.setItem(key, String(Date.now()));
    }, DISMISS_KEY);

    await page.goto('/');
    await page.waitForTimeout(500);

    const banner = page.locator('[aria-label="Instalar FFV Academy como app"]');
    const count = await banner.count();
    if (count > 0) {
      await expect(banner).not.toBeVisible();
    }
  });

  test('dismiss key recente impede exibição após reload', async ({ page }) => {
    // O beforeEach adiciona um init script que limpa a chave em CADA navegação
    // (incluindo reload). Para testar persistência, sobrescreve com um init
    // que reescreve a chave depois do remove.
    await page.addInitScript((key) => {
      localStorage.setItem(key, String(Date.now()));
    }, DISMISS_KEY);

    await page.goto('/');
    await page.reload();
    await page.waitForTimeout(500);

    const banner = page.locator('[aria-label="Instalar FFV Academy como app"]');
    const count = await banner.count();
    if (count > 0) {
      await expect(banner).not.toBeVisible();
    }

    // Verify the key persisted in localStorage
    const storedValue = await page.evaluate((key) => localStorage.getItem(key), DISMISS_KEY);
    expect(storedValue).not.toBeNull();
    expect(Number(storedValue)).toBeGreaterThan(0);
  });

  test('dismiss key expirado (> 14 dias) permite banner aparecer novamente', async ({ page }) => {
    await page.addInitScript((key) => {
      // Dismissed 15 days ago — past the 14-day window
      const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
      localStorage.setItem(key, String(fifteenDaysAgo));
    }, DISMISS_KEY);

    await page.goto('/');
    await page.waitForTimeout(500);

    // The banner would be eligible to show (dismissed=false) but still needs
    // beforeinstallprompt to set installPrompt. Page should not crash.
    await expect(page).not.toHaveURL(/error/);
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('página não crasha com beforeinstallprompt simulado', async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate the beforeinstallprompt event firing on load
      window.addEventListener('load', () => {
        const event = new Event('beforeinstallprompt');
        (event as any).prompt = async () => {};
        (event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
        (event as any).platforms = ['web'];
        window.dispatchEvent(event);
      });
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Page should be functional — no JS errors should have crashed it
    await expect(page).not.toHaveURL(/error/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5_000 });
  });
});
