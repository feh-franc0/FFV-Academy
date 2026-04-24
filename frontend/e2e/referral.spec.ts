import { test, expect } from '@playwright/test';

/**
 * Captura de ?ref=<id> via ReferralCapture — escrito em localStorage
 * sob STORAGE_KEYS.REFERRAL ('ffv_referral'). Whitelist: [a-z0-9]{3,32}.
 */
test('referral capturado da URL e persistido no localStorage', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/?ref=fulano123&skipOnboarding=1');

  // ReferralCapture roda em useEffect, então pequeno settle.
  await expect.poll(async () => {
    return await page.evaluate(() => localStorage.getItem('ffv_referral'));
  }).not.toBeNull();

  const raw = await page.evaluate(() => localStorage.getItem('ffv_referral'));
  expect(raw).toBeTruthy();
  const record = JSON.parse(raw!);
  expect(record.refId).toBe('fulano123');
});

test('referral com id inválido é rejeitado', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await page.evaluate(() => localStorage.clear());

  // Caractere proibido: whitelist bloqueia.
  await page.goto('/?ref=<script>&skipOnboarding=1');
  await page.waitForTimeout(500);
  const raw = await page.evaluate(() => localStorage.getItem('ffv_referral'));
  expect(raw).toBeNull();
});
